"""Local capture budgets, JPEG dimensions/quality, retry and duplicate-fetch checks.
Real OS share sheets and hosted Storage Egress are outside this fixture.
"""
import asyncio, ast
from pathlib import Path
from PIL import Image
from playwright.async_api import async_playwright

# Reuse the existing isolated modal fixture without invoking its test runner.
fixture = ast.parse(Path('e2e/consorcio_abortsignal_compat_test.py').read_text())
values = {node.targets[0].id: ast.literal_eval(node.value) for node in fixture.body
          if isinstance(node, ast.Assign) and isinstance(node.targets[0], ast.Name)
          and node.targets[0].id in ('MOCKS', 'RENDER', 'IPHONE_UA')}
OUT = Path('/tmp/browser/hd-check')
OUT.mkdir(parents=True, exist_ok=True)

INSTRUMENT = '''() => {
  window.hd = {captures: [], qualities: [], fetches: [], xhr: [], failHigh: false, failed: false};
  const get = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function(...args) {
    const ctx = get.apply(this, args);
    if (ctx && args[0] === '2d' && this.width >= 800 && this.height >= 400) {
      window.hd.captures.push([this.width, this.height]);
      const read = ctx.getImageData.bind(ctx);
      ctx.getImageData = (...params) => {
        if (window.hd.failHigh && !window.hd.failed && this.width > 1600 && this.height !== 3055) {
          window.hd.failed = true;
          throw new Error('simulated canvas allocation failure');
        }
        return read(...params);
      };
    }
    return ctx;
  };
  const encode = HTMLCanvasElement.prototype.toBlob;
  HTMLCanvasElement.prototype.toBlob = function(cb, type, quality) {
    if (type === 'image/jpeg') window.hd.qualities.push(quality);
    return encode.call(this, cb, type, quality);
  };
  const fetch = window.fetch;
  window.fetch = (...args) => { window.hd.fetches.push(String(args[0])); return fetch(...args); };
  const open = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method,url,...args) { window.hd.xhr.push(String(url)); return open.call(this,method,url,...args); };
}'''

async def main():
 async with async_playwright() as p:
  cases = [('desktop', p.chromium, None, False), ('android', p.chromium, 'Mozilla/5.0 (Linux; Android 14) Chrome/130.0 Mobile Safari/537.36', False),
           ('iphone-old', p.chromium, values['IPHONE_UA'].replace('18_0','14_0'), True),
           ('iphone-new', p.chromium, values['IPHONE_UA'], True),
           ('iphone-chrome', p.chromium, values['IPHONE_UA'].replace('Version/18.0','CriOS/130.0'), True),
           ('ipad', p.chromium, values['IPHONE_UA'].replace('iPhone','iPad'), True),
           ('ipad-chrome', p.chromium, values['IPHONE_UA'].replace('iPhone','iPad').replace('Version/18.0','CriOS/130.0'), True),
           ('safari-desktop', p.webkit, None, False)]
  for name, engine, ua, ios in cases:
   browser = await engine.launch(headless=True)
   context = await browser.new_context(viewport=({'width':390,'height':844} if name.startswith('iphone') else {'width':820,'height':1180} if name.startswith('ipad') else {'width':1280,'height':1800}), **({'user_agent':ua} if ua else {}))
   page = await context.new_page()
   for pattern, body in values['MOCKS']:
    def make_handler(body):
     async def handler(route):
      await route.fulfill(content_type='application/javascript', body=body)
     return handler
    await page.route(pattern, make_handler(body))
   await page.goto('http://localhost:8080',wait_until='domcontentloaded')
   await page.evaluate(values['RENDER'])
   button = page.get_by_role('button',name='📸 Salvar imagem').filter(visible=True).first
   await button.wait_for()
   await page.evaluate(INSTRUMENT)
   for attempt in range(2):
    # Force one high-resolution failure, then ensure a successful lower retry.
    await page.evaluate('(fail) => {hd.failHigh=fail;hd.failed=false;hd.captures=[];hd.fetches=[];hd.xhr=[];hd.qualities=[];}', attempt == 1 and name != 'safari-desktop')
    path = OUT / f'{name}-{attempt}.jpg'
    if ios:
     async with page.expect_popup() as event: await button.click()
     popup = await event.value
     await popup.locator('img').wait_for(timeout=60000)
     data = await popup.locator('img').evaluate('async img => Array.from(new Uint8Array(await (await fetch(img.src)).arrayBuffer()))')
     path.write_bytes(bytes(data))
     await popup.close()
    else:
     async with page.expect_download(timeout=60000) as event: await button.click()
     await (await event.value).save_as(path)
    await button.wait_for(state='visible')
    assert await button.is_enabled()
    result = await page.evaluate('hd')
    with Image.open(path) as image:
     assert image.size == (2460,3055), (name,image.size)
     assert image.format == 'JPEG'
     assert image.convert('RGB').getextrema()[0][0] < 100, 'blank image'
    assert result['qualities'] == [0.95], result
    assert not [url for url in result['fetches'] + result['xhr'] if '/storage/' in url], result
    if attempt == 1 and name != 'safari-desktop': assert result['failed'], result
    captures = [size for size in result['captures'] if size != [2460,3055]]
    assert captures and max(w*h for w,h in captures) <= (4000000 if name == 'iphone-old' else 7500000), (name,captures)
    assert max(w for w,h in captures) > 800, (name,captures)
    print(name,attempt,'capture sizes',captures,'JPEG',path.stat().st_size,'bytes; no Storage fetch/XHR')
   await page.get_by_role('dialog').screenshot(path=str(OUT/f'{name}-modal.png'))
   await browser.close()
asyncio.run(main())
