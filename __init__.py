"""
LA CASA MALDITA — gustaafvito.creador.ia
Extensión frontend: convierte workflows marcados en "habitaciones" con panel temático.
Un workflow se marca con  extra.casa_maldita.espiritu = "<id>"  y se configura en web/espiritus/<id>.json
"""
import os
import shutil

NODE_CLASS_MAPPINGS = {}
NODE_DISPLAY_NAME_MAPPINGS = {}
WEB_DIRECTORY = "./web"

_HERE = os.path.dirname(os.path.abspath(__file__))
_POSTERS = os.path.join(_HERE, "web", "posters")

try:
    import folder_paths
    from aiohttp import web
    from server import PromptServer

    @PromptServer.instance.routes.post("/casa_maldita/fijar_poster")
    async def _fijar_poster(request):
        """Copia un póster de output/casa_maldita/posters a la extensión (web/posters/<espiritu>.png)."""
        data = await request.json()
        espiritu = "".join(ch for ch in str(data.get("espiritu", "")) if ch.isalnum() or ch in "_-")
        archivo = os.path.basename(str(data.get("archivo", "")))
        if not espiritu or not archivo.lower().endswith((".png", ".jpg", ".jpeg", ".webp")):
            return web.json_response({"ok": False, "error": "datos no válidos"}, status=400)
        origen = os.path.join(folder_paths.get_output_directory(), "casa_maldita", "posters", archivo)
        if not os.path.isfile(origen):
            return web.json_response({"ok": False, "error": "no existe " + archivo}, status=404)
        os.makedirs(_POSTERS, exist_ok=True)
        destino = os.path.join(_POSTERS, espiritu + os.path.splitext(archivo)[1].lower())
        shutil.copyfile(origen, destino)
        return web.json_response({"ok": True, "ruta": "posters/" + os.path.basename(destino)})
except Exception as e:  # la extensión funciona igual sin la ruta
    print("[casa_maldita] ruta de pósters no disponible:", e)

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]
