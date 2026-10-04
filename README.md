# 🏚 La Casa Maldita

**Doce habitaciones de terror para ComfyUI.** Cada habitación es un workflow con su propio panel temático: eliges, arrastras tu
imagen o tu vídeo, pulsas un botón… y el personaje que vive allí hace el resto. Con vestíbulo, música propia y voces.

*English version: [README_EN.md](README_EN.md)*

![Las doce puertas](docs/las_doce_puertas.jpg)

## Las habitaciones

| # | Habitación | Qué hace | Motor |
|---|---|---|---|
| 01 | 🔮 **La Médium** | Describes una escena y ella la «ve»: texto → imagen | Krea 2 Turbo |
| 02 | 🩻 **El Forense** | Amplía y restaura una imagen | SeedVR2 3B |
| 03 | 🧵 **La Costurera** | Retoca una zona de la imagen: pintas la máscara y dices qué coser | Z-Image Turbo |
| 04 | 🎭 **El Marionetista** | Copia la pose, la silueta o la profundidad de una figura en un personaje nuevo | SDXL + ControlNet Union |
| 05 | 🪞 **El Doppelgänger** | Pone a tu personaje en otro lugar, haciendo otra cosa | FLUX.2 Klein 4B |
| 06 | 🌘 **La Pesadilla** | Texto → vídeo con sonido | LTX 2.5 |
| 07 | 🖼 **El Retrato** | Da vida a una imagen: imagen → vídeo con sonido | LTX 2.5 |
| 08 | ✝ **El Exorcista** | Escena completa con voz y sonido a partir de un personaje | MiniMax H3 ¹ |
| 09 | 🕺 **El Poseso** | Pasa el movimiento de un vídeo a tu personaje | Wan SCAIL-2 |
| 10 | 🔤 **La Ouija** | Hace hablar a una foto con un audio | MiniMax H3 ¹ · Wan HuMo |
| 11 | ⚱ **El Embalsamador** | Mejora y amplía un vídeo | SeedVR2 7B |
| 12 | ⚰ **El Sepulturero** | Une varios vídeos con transiciones | (sin modelos) |

Las habitaciones se pasan el trabajo entre ellas: desde una imagen de La Médium puedes «llevarla a la morgue», «al espejo»,
«a la galería»… sin descargar ni volver a subir nada.

¹ Lee la [nota sobre MiniMax H3](#nota-sobre-minimax-h3).

## Requisitos

- **ComfyUI 0.37 o más reciente** (necesita el soporte nativo de SCAIL-2, MiniMax H3, LTX 2.5 y Krea 2).
- **Gráfica de 16 GB de VRAM** y **32 GB de RAM**. Probado en una RTX 5070 Ti.
- **Disco:** unos 186 GB si instalas los modelos de las 12 habitaciones. Puedes instalar solo las que quieras.

## Instalación

1. **Copia la Casa** dentro de `ComfyUI/custom_nodes`:
   ```bash
   cd ComfyUI/custom_nodes
   git clone https://github.com/TU_USUARIO/la-casa-maldita casa_maldita
   ```
2. **Instala los nodos** que usan las habitaciones. Lo más fácil es abrir cualquier habitación y usar
   *ComfyUI-Manager → Install Missing Custom Nodes*. La lista completa:

   | Nodo | Habitaciones |
   |---|---|
   | [ComfyUI-SeedVR2_VideoUpscaler](https://github.com/numz/ComfyUI-SeedVR2_VideoUpscaler) | 02, 11 |
   | [ComfyUI-KJNodes](https://github.com/kijai/ComfyUI-KJNodes) | 03, 08, 12 |
   | [comfyui_controlnet_aux](https://github.com/Fannovel16/comfyui_controlnet_aux) | 04 |
   | [ComfyUI-Impact-Pack](https://github.com/ltdrdata/ComfyUI-Impact-Pack) | 04 |
   | [ComfyUI-GGUF](https://github.com/city96/ComfyUI-GGUF) | 06, 07 |
   | [ComfyUI-MiniMax-H3-Turbo](https://github.com/Larryvrh/ComfyUI-MiniMax-H3-Turbo) | 08, 10 |
   | [ComfyUI-Frame-Interpolation](https://github.com/Fannovel16/ComfyUI-Frame-Interpolation) | 08, 09 |
   | [ComfyUI-Easy-Use](https://github.com/yolain/ComfyUI-Easy-Use) | 08 |
   | [ComfyUI-SCAIL2-Easy](https://github.com/nkxx188/ComfyUI-SCAIL2-Easy) | 09 |
   | [ComfyUI-VideoHelperSuite](https://github.com/Kosinkadink/ComfyUI-VideoHelperSuite) | 09 |

3. **Descarga los modelos** de las habitaciones que quieras: lista con carpetas, tamaños y enlaces en **[MODELOS.md](MODELOS.md)**.
   Si te falta alguno, la habitación te lo dice al entrar con su enlace de descarga.
4. **Reinicia ComfyUI** y recarga el navegador (Ctrl+F5).

## Cómo se usa

- Pulsa el botón **🏚 LA CASA** (abajo a la derecha) para abrir **el vestíbulo** con las doce puertas.
- Elige una puerta. Toca el retrato de la portada para entrar.
- Rellena el panel (imagen, vídeo o texto; mejor en inglés) y pulsa el botón grande.
- Botones **🔊 Voz** y **🔊 Música** para silenciar el narrador o la música por separado.
- **👁 Ver las entrañas** enseña el workflow de ComfyUI que hay debajo, por si quieres trastear.

Los workflows también aparecen en el navegador de plantillas de ComfyUI, en la sección *casa_maldita*.

## Licencias

- **Código, workflows, pósters, música y voces de la Casa:** [GPL-3.0](LICENSE), la misma que ComfyUI.
- **Modelos:** cada uno tiene la suya; los descargas tú desde su página oficial y aceptas sus condiciones.
  Resumen y enlaces en [LICENCIAS.md](LICENCIAS.md).
- Todo el arte, la música y las voces de la Casa se han **generado con IA**.

### Nota sobre MiniMax H3

El Exorcista (08) y el modo «Hablar la foto» de La Ouija (10) usan **MiniMax H3**. Su licencia
([MiniMax H3 Community License](https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE)) **no cubre la Unión Europea,
el Reino Unido, Corea del Sur ni EE. UU.**: si vives allí, consulta las condiciones con MiniMax antes de usarlo. Además pide
indicar «Powered by MiniMax H3» y avisar de que el contenido está generado por IA. Este repositorio no incluye ningún modelo.

## Créditos

- Modelos: Krea, ByteDance-Seed (SeedVR2, HuMo), Tongyi-MAI (Z-Image), RunDiffusion (Juggernaut XL), xinsir (ControlNet Union),
  Black Forest Labs (FLUX.2 Klein), Lightricks (LTX 2.5), MiniMax (H3), Zhipu AI (SCAIL-2), Wan-AI, Meta (SAM 3.1), y quienes
  publican los cuantizados enlazados en [MODELOS.md](MODELOS.md).
- Nodos: los autores de la tabla de instalación, y el equipo de ComfyUI.
- Música: generada con [ACE-Step 1.5](https://github.com/ace-step/ACE-Step). Voces: ElevenLabs (plan con licencia comercial).

Hecho por **gustaafvito.creador.ia**.
