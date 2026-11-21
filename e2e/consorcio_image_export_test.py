import asyncio, json
from pathlib import Path
from PIL import Image
from playwright.async_api import async_playwright
async def main():
 Path('/tmp/browser/ios-export').mkdir(parents=True, exist_ok=True)
 async with async_playwright() as p:
  browser = await p.chromium.launch(headless=True)
  for name,ua,width,height in [('iphone-safari','Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1',390,844),('iphone-chrome','Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 CriOS/130.0 Mobile/15E148 Safari/604.1',390,844),('ipad','Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1',820,1180),('ipad-chrome','Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 CriOS/130.0 Mobile/15E148 Safari/604.1',820,1180),('ipad-desktop','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15',886,897),('android','Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/130.0 Mobile Safari/537.36',412,915),('windows','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0 Safari/537.36',1280,1800)]:
   context=await browser.new_context(viewport={'width':width,'height':height},user_agent=ua,accept_downloads=True)
   page=await context.new_page()
   if name.startswith('ipad'):
    # Reproduces unresolved native sharing without relying on OS share sheets.
    await page.add_init_script("window.shareCalls = 0; Object.defineProperty(navigator, 'canShare', {value: () => true}); Object.defineProperty(navigator, 'share', {value: () => { window.shareCalls++; return new Promise(() => {}); }}); Object.defineProperty(navigator, 'maxTouchPoints', {value: 5}); Object.defineProperty(navigator, 'platform', {value: 'MacIntel'});")
   await page.route("**/src/hooks/useVendedor.ts", lambda route: route.fulfill(content_type="application/javascript",body="export const useVendedor = () => ({vendedor: {nome: 'Vendedor teste', whatsapp: '94999999999', instagram: 'compraacelerada', fotoPerfilUrl: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect width=%22100%22 height=%22100%22 fill=%22red%22/%3E%3C/svg%3E'}});"))
   await page.route("**/src/services/consorcioService.ts", lambda route: route.fulfill(content_type="application/javascript",body="export const subscribeToConsorcio = (a,b,cb) => {cb([{tabelaId: 'test',nomeExibicao: 'Sem Emplacamento',fraseExibicao: 'Sem Emplacamento',parcelas:[{meses:80,valor:350},{meses:60,valor:450},{meses:48,valor:580.25},{meses:36,valor:750.90}]},{tabelaId: 'test2',nomeExibicao: 'Com Emplacamento',fraseExibicao: 'Com Emplacamento',parcelas:[{meses:80,valor:380},{meses:60,valor:480},{meses:48,valor:610.25},{meses:36,valor:780.90}]}]);return ()=>{};};"))
   await page.route('**/src/services/creditoService.ts', lambda route: route.fulfill(content_type='application/javascript',body='export const getCreditosParaMoto = async () => new Map();'))
   errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   await page.goto('http://localhost:8080',wait_until='networkidle')
   await page.evaluate('''async () => {
    await import('/src/index.css');
    const Rm = await import('/node_modules/.vite/deps/react.js'); const React = Rm.createElement ? Rm : Rm.default;
    const rdc = await import('/node_modules/.vite/deps/react-dom_client.js'); const createRoot = rdc.createRoot || rdc.default.createRoot;
    const {ConsorcioModal} = await import('/src/components/ConsorcioModal.tsx');
    const root=document.createElement('div');document.body.append(root);
    const canvas=document.createElement('canvas');canvas.width=200;canvas.height=100;
    const ctx=canvas.getContext('2d');ctx.fillStyle='red';ctx.fillRect(10,10,180,80);
    createRoot(root).render(React.createElement(ConsorcioModal,{bike:{id:'test',name:'Teste exportação Honda',category:'Street',images:[{url:canvas.toDataURL(),color:'red'}],specs:{},consorcio:{parcelas:[]}},isOpen:true,onClose:()=>{},tabelasConsorcio:['test']}));
   }''')
   await page.get_by_role('button',name='📸 Salvar imagem').filter(visible=True).first.wait_for()
   await page.get_by_role('dialog').screenshot(path='/tmp/browser/ios-export/'+name+'-modal.png')
   original_layout = await page.get_by_role('dialog').evaluate('''el => Array.from(el.querySelectorAll('.grid.grid-cols-2')).map(row => ({text:row.textContent,rect:[row.offsetWidth,row.offsetHeight],style:row.getAttribute('style')}))''')
   # Capture actual renderer baseline coordinates in the caller document.
   # Tailwind's block image reset previously added 9px at a 20px font size,
   # even though the private cloned document already normalized the probe.
   await page.evaluate('''() => {
    window.probeBaselineErrors = [];
    const append = Node.prototype.appendChild;
    Node.prototype.appendChild = function(child) {
     const result = append.call(this, child);
     if (child instanceof HTMLImageElement && child.src === 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7' && this.isConnected && this.firstChild instanceof HTMLSpanElement) {
      const span = this.firstChild;
      const actual = child.offsetTop - span.offsetTop + 2;
      const previous = child.style.display;
      child.style.display = 'inline-block';
      const reference = child.offsetTop - span.offsetTop + 2;
      child.style.display = previous;
      window.probeBaselineErrors.push(actual - reference);
     }
     return result;
    };
   }''')
   if name in ['android','windows']:
    async with page.expect_download(timeout=45000) as event:
     await page.get_by_role('button',name='📸 Salvar imagem').filter(visible=True).first.click()
    download=await event.value
    assert download.suggested_filename == 'consorcio-Teste exportação Honda.jpg'
    await download.save_as('/tmp/browser/ios-export/'+name+'.jpg')
    print(name,'download',download.suggested_filename)
   else:
    async with page.expect_popup() as event:
     await page.get_by_role('button',name='📸 Salvar imagem').filter(visible=True).first.click()
    popup=await event.value
    await popup.locator('img').wait_for(timeout=45000)
    assert await popup.locator('img').evaluate('(img)=>[img.naturalWidth,img.naturalHeight]') == [2460,3055]
    await popup.locator('img').screenshot(path='/tmp/browser/ios-export/'+name+'.png')
    jpeg = await popup.locator('img').evaluate('''async img => Array.from(new Uint8Array(await (await fetch(img.src)).arrayBuffer()))''')
    Path('/tmp/browser/ios-export/'+name+'.jpg').write_bytes(bytes(jpeg))
    # A decoded JPEG with the right dimensions can still be entirely white.
    # Require the red motorcycle from this fixture to reach the preview.
    with Image.open('/tmp/browser/ios-export/'+name+'.png') as capture:
     red_pixels = sum(1 for r,g,b in capture.convert('RGB').getdata() if r > 180 and g < 80 and b < 80)
     assert red_pixels > capture.width * capture.height * 0.05, name + ' blank/incomplete preview'
    if name.startswith('ipad'):
     assert await page.evaluate('window.shareCalls') == 0
    print(name,await popup.locator('img').evaluate('(img)=>({width:img.naturalWidth,height:img.naturalHeight})'))
    await popup.close()
   assert await page.get_by_role('button',name='📸 Salvar imagem').filter(visible=True).first.is_enabled()
   assert await page.get_by_role('dialog').evaluate('''el => Array.from(el.querySelectorAll('.grid.grid-cols-2')).map(row => ({text:row.textContent,rect:[row.offsetWidth,row.offsetHeight],style:row.getAttribute('style')}))''') == original_layout
   assert await page.evaluate('''() => !Array.from(document.head.querySelectorAll('style')).some(style => style.textContent.includes('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'))''')
   if name.startswith('iphone') or name.startswith('ipad'):
    baseline_errors = await page.evaluate('window.probeBaselineErrors')
    assert baseline_errors, 'No caller-document font measurements captured'
    assert all(error == 0 for error in baseline_errors), (name, baseline_errors)
    print(name, 'font baseline offsets', baseline_errors)
   print('errors',errors)
   assert not [error for error in errors if 'Missing Supabase environment variables' not in error]
   await context.close()
  await browser.close()
asyncio.run(main())
