import asyncio
from pathlib import Path
from PIL import Image
from playwright.async_api import async_playwright

# Older iPhone Safari builds have no AbortSignal.timeout; the export must still work there.
OUT = Path("/tmp/browser/ios-export")
OUT.mkdir(parents=True, exist_ok=True)

KILL_TIMEOUT = "Object.defineProperty(AbortSignal, 'timeout', {value: undefined, configurable: true});"
IPHONE_UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1"

MOCKS = [
    ("**/src/hooks/useVendedor.ts", "export const useVendedor = () => ({vendedor: {nome: 'Vendedor teste', whatsapp: '94999999999', instagram: 'compraacelerada', fotoPerfilUrl: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect width=%22100%22 height=%22100%22 fill=%22red%22/%3E%3C/svg%3E'}});"),
    ("**/src/services/consorcioService.ts", "export const subscribeToConsorcio = (a,b,cb) => {cb([{tabelaId: 'test',nomeExibicao: 'Plano teste',fraseExibicao: 'Consórcio Honda',parcelas:[{meses:80,valor:350},{meses:60,valor:450}]}]);return ()=>{};};"),
    ("**/src/services/creditoService.ts", "export const getCreditosParaMoto = async () => new Map();"),
]

# The sandbox has no Supabase env vars; that page error is environmental, not export-related.
IGNORED = ("Missing Supabase environment variables",)

RENDER = '''async () => {
  await import('/src/index.css');
  const rm = await import('/node_modules/.vite/deps/react.js'); const React = rm.createElement ? rm : rm.default;
  const rd = await import('/node_modules/.vite/deps/react-dom_client.js'); const createRoot = rd.createRoot || rd.default.createRoot;
  const {ConsorcioModal} = await import('/src/components/ConsorcioModal.tsx');
  const root=document.createElement('div');document.body.append(root);
  const canvas=document.createElement('canvas');canvas.width=200;canvas.height=100;
  const ctx=canvas.getContext('2d');ctx.fillStyle='red';ctx.fillRect(10,10,180,80);
  createRoot(root).render(React.createElement(ConsorcioModal,{bike:{id:'test',name:'Teste exportação Honda',category:'Street',images:[{url:canvas.toDataURL(),color:'red'}],specs:{},consorcio:{parcelas:[]}},isOpen:true,onClose:()=>{},tabelasConsorcio:['test']}));
}'''


def make_handler(body):
    async def handler(route):
        await route.fulfill(content_type="application/javascript", body=body)
    return handler


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 390, "height": 844}, user_agent=IPHONE_UA)
        page = await context.new_page()
        await page.add_init_script(KILL_TIMEOUT)
        for pattern, body in MOCKS:
            await page.route(pattern, make_handler(body))
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        await page.goto("http://localhost:8080", wait_until="domcontentloaded")
        await page.evaluate(RENDER)
        button = page.get_by_role("button", name="📸 Salvar imagem").filter(visible=True).first
        await button.wait_for(timeout=90000)
        async with page.expect_popup() as event:
            await button.click()
        popup = await event.value
        await popup.locator("img").wait_for(timeout=60000)
        dims = await popup.locator("img").evaluate("(img)=>[img.naturalWidth,img.naturalHeight]")
        assert dims == [2460, 3055], "wrong dims " + str(dims)
        await popup.locator("img").screenshot(path=str(OUT / "iphone-no-abortsignal-project.png"))
        with Image.open(OUT / "iphone-no-abortsignal-project.png") as capture:
            red = sum(1 for r, g, b in capture.convert("RGB").getdata() if r > 180 and g < 80 and b < 80)
            assert red > capture.width * capture.height * 0.05, "blank/incomplete preview"
        abort_errors = [e for e in errors if "AbortSignal" in e]
        assert not abort_errors, "AbortSignal failure: " + str(abort_errors)
        real = [e for e in errors if not any(i in e for i in IGNORED)]
        assert not real, "page errors: " + str(real)
        assert await button.is_enabled(), "button disabled after export"
        print("iphone without AbortSignal.timeout: preview OK", dims)
        await popup.close()
        await context.close()
        await browser.close()

asyncio.run(main())
