# La Casa Maldita · inventario de licencias (4-oct-2026)

Revisado contra las fichas de Hugging Face y los textos de licencia originales. No es asesoría legal:
para vender de forma habitual, consúltalo con un gestor o abogado.

Leyenda: ✅ sin problema · ⚠️ se puede, con condiciones · ❌ hay que cambiarlo antes de vender

## Por habitación

| # | Habitación | Modelos | Licencia | Estado |
|---|---|---|---|---|
| 1 | La Médium | Krea 2 Turbo · Qwen3-VL 4B · VAE Qwen Image | Krea 2 Community (uso comercial si facturas < 1 M$/año) · Apache 2.0 | ✅ |
| 2 | El Forense | SeedVR2 3B | Apache 2.0 | ✅ |
| 3 | La Costurera | Z-Image Turbo · Qwen3 4B · VAE `ae` | Apache 2.0 | ✅ |
| 4 | El Marionetista | Juggernaut XL v9 · ControlNet Union promax · DWPose/YOLOX | OpenRAIL-M · Apache 2.0 | ✅ |
|   |   | Depth Anything V2 **Small** (`depth_anything_v2_vits.pth`) — 04-oct, antes Large (CC-BY-NC) | Apache 2.0 | ✅ |
| 5 | El Doppelgänger | FLUX.2 Klein **4B** fp8 · Qwen3 4B · FLUX.2 small decoder — 04-oct, antes Klein 9B (no comercial) | Apache 2.0 | ✅ |
| 6 | La Pesadilla | LTX 2.5 · Gemma 4 · Gemma 2 2B | LTX-2.x Community (gratis si facturas < 10 M$/año; los vídeos son tuyos) · Apache 2.0 · Gemma | ✅ |
| 7 | El Retrato | igual que la 6 | igual que la 6 | ✅ |
| 8 | El Exorcista | **MiniMax H3** (ref2va + VAEs + TE Qwen3-VL 32B) · Turbo LoRA | **MiniMax H3 Community: excluye la UE, Reino Unido, Corea y EE. UU.** · LoRA Apache 2.0 | ❌ |
| 9 | El Poseso | SCAIL-2 · Wan 2.1 · lightx2v · SAM 3.1 · umt5 · CLIP-H | MIT · Apache 2.0 · SAM License (comercial permitido) | ✅ |
|   |   | Nodos: SCAIL-2 nativo + **ComfyUI-SCAIL2-Easy** + VHS Load Video + RIFE — 04-oct, antes nghtdrp (sin licencia) | Apache 2.0 · GPL-3 · MIT | ✅ |
| 10 | La Ouija · Otra escena | HuMo 17B · Whisper · Wan 2.1 | Apache 2.0 · MIT | ✅ |
|    | La Ouija · Hablar la foto | **MiniMax H3** | igual que la 8 | ❌ |
| 11 | El Embalsamador | SeedVR2 7B | Apache 2.0 | ✅ |
| 12 | El Sepulturero | (sin modelos) | — | ✅ |

## MiniMax H3, el problema gordo
- Texto: *"Excluded Territories" means the European Union, the United Kingdom, the Republic of Korea and the United States of America.*
  Fuera de esos territorios no hay licencia ni para usarlo, ni para distribuirlo, ni para usar sus resultados. **España está dentro de la UE.**
- Además obliga a mostrar «Powered by MiniMax H3» en cualquier producto que lo use y a avisar de que el contenido es generado por IA.
- MiniMax ofrece licencias para esos territorios bajo petición (api@minimax.io).

## Nodos de terceros (el comprador los instala con ComfyUI Manager; no se reparten con el pack)
| Nodo | Licencia | Habitaciones |
|---|---|---|
| ComfyUI-SeedVR2_VideoUpscaler | Apache 2.0 | 2, 11 |
| ComfyUI-KJNodes | GPL-3 | 3, 8, 12 |
| comfyui_controlnet_aux | Apache 2.0 | 4 |
| ComfyUI-Impact-Pack | GPL-3 | 4 |
| ComfyUI-GGUF | Apache 2.0 | 6, 7 |
| ComfyUI-MiniMax-H3-Turbo | Apache 2.0 | 8, 10 |
| ComfyUI-Frame-Interpolation | MIT | 8, 9 |
| ComfyUI-Easy-Use | GPL-3 | 8 |
| ComfyUI-SCAIL2-Easy (nkxx188) | Apache 2.0 | 9 |
| ComfyUI-VideoHelperSuite | GPL-3 | 9 |

ComfyUI es GPL-3. Se discute si una extensión como el panel de la Casa hereda la GPL; en la práctica se venden
workflows y paneles, pero no se puede impedir legalmente que un comprador lo comparta.

## Audio
- Voces de ElevenLabs (plan Starter): licencia comercial **para siempre** de todo lo generado mientras pagabas,
  aunque canceles. Se puede cancelar sin perder las 12 voces.
- Música de ACE-Step 1.5 (Turbo y XL): MIT.

## Fuera de la Casa (para cuando toque Neural Underground)
- Qwen Image 2.1 (módulos 03, 06 y 11) tiene licencia **qwen-research**: revisar antes de vender Neural.

## Fuentes
- MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- LTX-2.x: https://github.com/Lightricks/LTX-2/blob/main/LICENSE-2_x
- Krea 2: https://huggingface.co/krea/Krea-2-Turbo (LICENSE.pdf)
- FLUX.2 Klein 9B: https://huggingface.co/black-forest-labs/FLUX.2-klein-9B/blob/main/LICENSE.md
- Depth Anything V2 Large: https://huggingface.co/depth-anything/Depth-Anything-V2-Large
- SAM 3.1: https://huggingface.co/facebook/sam3.1/blob/main/LICENSE
- ElevenLabs: https://help.elevenlabs.io/hc/en-us/articles/15993008593297-What-happens-to-my-content-after-my-subscription-ends
