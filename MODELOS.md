# Modelos de La Casa Maldita

Total sin repetir: **~186 GB**. No hace falta bajarlo todo: descarga solo los de las habitaciones que vayas a usar.
Si falta algo, la propia habitación te lo dice al entrar («El ritual está incompleto») con el enlace de descarga.

Las subcarpetas dan igual: si tienes un modelo en `models/loras/SCAIL/…`, el panel lo encuentra por su nombre.

⚡ = formato **NVFP4**, pensado para gráficas RTX 50 (Blackwell). En otras gráficas usa la versión `int8-convrot` o `bf16`
del mismo modelo (por ejemplo `gemma4-12b-with-proj-ltx-2.5-comfy-int8-convrot.safetensors` del repo oficial
[Lightricks/LTX-2.5](https://huggingface.co/Lightricks/LTX-2.5)) y cámbialo en el nodo cargador del workflow.

🔑 = el repo pide iniciar sesión en Hugging Face y aceptar la licencia del modelo antes de descargar.

La licencia de cada modelo está en [LICENCIAS.md](LICENCIAS.md).

### 01 · La Médium

| Archivo | Carpeta (`ComfyUI/models/…`) | Tamaño | Descarga |
|---|---|---|---|
| `krea2_turbo_int8_convrot.safetensors` | `diffusion_models` | 13.5 GB | [⬇](https://huggingface.co/Comfy-Org/Krea-2/resolve/main/diffusion_models/krea2_turbo_int8_convrot.safetensors) |
| `qwen3vl_4b_fp8_scaled.safetensors` | `text_encoders` | 5.2 GB | [⬇](https://huggingface.co/Comfy-Org/Krea-2/resolve/main/text_encoders/qwen3vl_4b_fp8_scaled.safetensors) |
| `qwen_image_vae.safetensors` | `vae` | 0.3 GB | [⬇](https://huggingface.co/Comfy-Org/Krea-2/resolve/main/vae/qwen_image_vae.safetensors) |

### 02 · El Forense

| Archivo | Carpeta (`ComfyUI/models/…`) | Tamaño | Descarga |
|---|---|---|---|
| `seedvr2_ema_3b_fp8_e4m3fn.safetensors` | `SEEDVR2` | 3.4 GB | [⬇](https://huggingface.co/numz/SeedVR2_comfyUI/resolve/main/seedvr2_ema_3b_fp8_e4m3fn.safetensors) |
| `ema_vae_fp16.safetensors` | `SEEDVR2` | 0.5 GB | [⬇](https://huggingface.co/numz/SeedVR2_comfyUI/resolve/main/ema_vae_fp16.safetensors) |

### 03 · La Costurera

| Archivo | Carpeta (`ComfyUI/models/…`) | Tamaño | Descarga |
|---|---|---|---|
| `z_image_turbo_bf16.safetensors` | `diffusion_models` | 12.3 GB | [⬇](https://huggingface.co/Comfy-Org/z_image_turbo/resolve/main/split_files/diffusion_models/z_image_turbo_bf16.safetensors) |
| `qwen_3_4b.safetensors` | `text_encoders` | 8.0 GB | [⬇](https://huggingface.co/Comfy-Org/z_image_turbo/resolve/main/split_files/text_encoders/qwen_3_4b.safetensors) |
| `ae.safetensors` | `vae` | 0.3 GB | [⬇](https://huggingface.co/Comfy-Org/z_image_turbo/resolve/main/split_files/vae/ae.safetensors) |

### 04 · El Marionetista

| Archivo | Carpeta (`ComfyUI/models/…`) | Tamaño | Descarga |
|---|---|---|---|
| `depth_anything_v2_vits.pth` | `(automático)` | — | se descarga sola |
| `yolox_l.onnx` | `(automático)` | — | se descarga sola |
| `dw-ll_ucoco_384.onnx` | `(automático)` | — | se descarga sola |
| `Juggernaut-XL_v9_RunDiffusionPhoto_v2.safetensors` | `checkpoints` | 7.1 GB | [⬇](https://huggingface.co/RunDiffusion/Juggernaut-XL-v9/resolve/main/Juggernaut-XL_v9_RunDiffusionPhoto_v2.safetensors) |
| `controlnet_union_sdxl_promax.safetensors` | `controlnet` | 2.5 GB | [⬇](https://huggingface.co/xinsir/controlnet-union-sdxl-1.0/resolve/main/diffusion_pytorch_model_promax.safetensors) (renómbralo a `controlnet_union_sdxl_promax.safetensors`) |
| `sdxl_vae.safetensors` | `vae` | 0.3 GB | [⬇](https://huggingface.co/stabilityai/sdxl-vae/resolve/main/sdxl_vae.safetensors) |

### 05 · El Doppelgänger

| Archivo | Carpeta (`ComfyUI/models/…`) | Tamaño | Descarga |
|---|---|---|---|
| `flux-2-klein-4b-fp8.safetensors` | `diffusion_models` | 4.1 GB | [⬇](https://huggingface.co/black-forest-labs/FLUX.2-klein-4b-fp8/resolve/main/flux-2-klein-4b-fp8.safetensors) |
| `qwen_3_4b.safetensors` | `text_encoders` | 8.0 GB | [⬇](https://huggingface.co/Comfy-Org/z_image_turbo/resolve/main/split_files/text_encoders/qwen_3_4b.safetensors) |
| `full_encoder_small_decoder.safetensors` | `vae` | 0.2 GB | [⬇](https://huggingface.co/black-forest-labs/FLUX.2-small-decoder/resolve/main/full_encoder_small_decoder.safetensors) |

### 06 · La Pesadilla

| Archivo | Carpeta (`ComfyUI/models/…`) | Tamaño | Descarga |
|---|---|---|---|
| `LTX-2.5-Distilled-Q3_K_M.gguf` | `diffusion_models` | 12.9 GB | [⬇](https://huggingface.co/Abiray/LTX-2.5-Distilled-GGUF/resolve/main/LTX-2.5-Distilled-Q3_K_M.gguf) |
| `ltx-2.5-latent-spatial-upscaler-x2-bf16-1.0.safetensors` | `latent_upscale_models` | 1.0 GB | [⬇](https://huggingface.co/Lightricks/LTX-2.5/resolve/main/latent_upscale_models/ltx-2.5-latent-spatial-upscaler-x2-bf16-1.0.safetensors) 🔑 |
| `gemma4-12b-with-proj-ltx-2.5-nvfp4.safetensors` ⚡ | `text_encoders` | 11.2 GB | [⬇](https://huggingface.co/Deadshot699/ltx-2.5-gemma4-12b-comfy-nvfp4/resolve/main/text_encoders/gemma4-12b-with-proj-ltx-2.5-nvfp4.safetensors) |
| `gemma_2_2b_it_elm_fp8_scaled.safetensors` | `text_encoders` | 2.6 GB | [⬇](https://huggingface.co/Comfy-Org/PixelDiT/resolve/main/text_encoders/gemma_2_2b_it_elm_fp8_scaled.safetensors) |
| `ltx-2.5-video-vae-bf16.safetensors` | `vae` | 1.5 GB | [⬇](https://huggingface.co/Lightricks/LTX-2.5/resolve/main/vae/ltx-2.5-video-vae-bf16.safetensors) 🔑 |
| `ltx-2.5-audio-vae-bf16.safetensors` | `vae` | 0.4 GB | [⬇](https://huggingface.co/Lightricks/LTX-2.5/resolve/main/vae/ltx-2.5-audio-vae-bf16.safetensors) 🔑 |

### 07 · El Retrato

| Archivo | Carpeta (`ComfyUI/models/…`) | Tamaño | Descarga |
|---|---|---|---|
| `LTX-2.5-Distilled-Q3_K_M.gguf` | `diffusion_models` | 12.9 GB | [⬇](https://huggingface.co/Abiray/LTX-2.5-Distilled-GGUF/resolve/main/LTX-2.5-Distilled-Q3_K_M.gguf) |
| `ltx-2.5-latent-spatial-upscaler-x2-bf16-1.0.safetensors` | `latent_upscale_models` | 1.0 GB | [⬇](https://huggingface.co/Lightricks/LTX-2.5/resolve/main/latent_upscale_models/ltx-2.5-latent-spatial-upscaler-x2-bf16-1.0.safetensors) 🔑 |
| `gemma_2_2b_it_elm_fp8_scaled.safetensors` | `text_encoders` | 2.6 GB | [⬇](https://huggingface.co/Comfy-Org/PixelDiT/resolve/main/text_encoders/gemma_2_2b_it_elm_fp8_scaled.safetensors) |
| `gemma4-12b-with-proj-ltx-2.5-nvfp4.safetensors` ⚡ | `text_encoders` | 11.2 GB | [⬇](https://huggingface.co/Deadshot699/ltx-2.5-gemma4-12b-comfy-nvfp4/resolve/main/text_encoders/gemma4-12b-with-proj-ltx-2.5-nvfp4.safetensors) |
| `ltx-2.5-video-vae-bf16.safetensors` | `vae` | 1.5 GB | [⬇](https://huggingface.co/Lightricks/LTX-2.5/resolve/main/vae/ltx-2.5-video-vae-bf16.safetensors) 🔑 |
| `ltx-2.5-audio-vae-bf16.safetensors` | `vae` | 0.4 GB | [⬇](https://huggingface.co/Lightricks/LTX-2.5/resolve/main/vae/ltx-2.5-audio-vae-bf16.safetensors) 🔑 |

### 08 · El Exorcista

| Archivo | Carpeta (`ComfyUI/models/…`) | Tamaño | Descarga |
|---|---|---|---|
| `rife47.pth` | `(automático)` | — | se descarga sola |
| `minimax_h3_ref2va_pruned_int8_convrot.safetensors` | `diffusion_models` | 21.0 GB | [⬇](https://huggingface.co/Comfy-Org/MiniMax-H3/resolve/main/diffusion_models/minimax_h3_ref2va_pruned_int8_convrot.safetensors) |
| `minimax_h3_turbo_v4_step600_ema.safetensors` | `loras` | 0.8 GB | [⬇](https://huggingface.co/larryvrh/MiniMax-H3-Turbo-Lora/resolve/main/minimax_h3_turbo_v4_step600_ema.safetensors) |
| `qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors` ⚡ | `text_encoders` | 15.7 GB | [⬇](https://huggingface.co/Comfy-Org/MiniMax-H3/resolve/main/text_encoders/qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors) |
| `minimax_h3_video_vae_int8_convrot.safetensors` | `vae` | 2.8 GB | [⬇](https://huggingface.co/Comfy-Org/MiniMax-H3/resolve/main/vae/minimax_h3_video_vae_int8_convrot.safetensors) |
| `minimax_h3_audio_vae_fp32.safetensors` | `vae` | 0.6 GB | [⬇](https://huggingface.co/Comfy-Org/MiniMax-H3/resolve/main/vae/minimax_h3_audio_vae_fp32.safetensors) |
| `taeh3.safetensors` | `vae_approx` | 0.0 GB | [⬇](https://huggingface.co/OzzyGT/taeh3/resolve/main/taeh3.safetensors) |

### 09 · El Poseso

| Archivo | Carpeta (`ComfyUI/models/…`) | Tamaño | Descarga |
|---|---|---|---|
| `rife47.pth` | `(automático)` | — | se descarga sola |
| `sam3.1_multiplex_fp16.safetensors` | `checkpoints` | 1.7 GB | [⬇](https://huggingface.co/Comfy-Org/sam3.1/resolve/main/checkpoints/sam3.1_multiplex_fp16.safetensors) |
| `clip_vision_h.safetensors` | `clip_vision` | 1.3 GB | [⬇](https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged/resolve/main/split_files/clip_vision/clip_vision_h.safetensors) |
| `wan2.1_14B_SCAIL_2_int8_convrot.safetensors` | `diffusion_models` | 16.7 GB | [⬇](https://huggingface.co/Comfy-Org/SCAIL-2/resolve/main/diffusion_models/wan2.1_14B_SCAIL_2_int8_convrot.safetensors) |
| `wan2.1_SCAIL_2_DPO_lora_bf16.safetensors` | `loras` | 1.2 GB | [⬇](https://huggingface.co/Comfy-Org/SCAIL-2/resolve/main/loras/wan2.1_SCAIL_2_DPO_lora_bf16.safetensors) |
| `lightx2v_I2V_14B_480p_cfg_step_distill_rank64_bf16.safetensors` | `loras` | 0.7 GB | [⬇](https://huggingface.co/Kijai/WanVideo_comfy/resolve/main/Lightx2v/lightx2v_I2V_14B_480p_cfg_step_distill_rank64_bf16.safetensors) |
| `umt5_xxl_fp8_e4m3fn_scaled.safetensors` | `text_encoders` | 6.7 GB | [⬇](https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged/resolve/main/split_files/text_encoders/umt5_xxl_fp8_e4m3fn_scaled.safetensors) |
| `wan_2.1_vae.safetensors` | `vae` | 0.3 GB | [⬇](https://huggingface.co/Comfy-Org/Wan_2.2_ComfyUI_Repackaged/resolve/main/split_files/vae/wan_2.1_vae.safetensors) |

### 10 · La Ouija

| Archivo | Carpeta (`ComfyUI/models/…`) | Tamaño | Descarga |
|---|---|---|---|
| `whisper_large_v3_fp16.safetensors` | `audio_encoders` | 3.1 GB | [⬇](https://huggingface.co/Comfy-Org/HuMo_ComfyUI/resolve/main/split_files/audio_encoders/whisper_large_v3_fp16.safetensors) |
| `humo_17B_fp8_e4m3fn.safetensors` | `diffusion_models` | 17.1 GB | [⬇](https://huggingface.co/Comfy-Org/HuMo_ComfyUI/resolve/main/split_files/diffusion_models/humo_17B_fp8_e4m3fn.safetensors) |
| `minimax_h3_ref2va_pruned_int8_convrot.safetensors` | `diffusion_models` | 21.0 GB | [⬇](https://huggingface.co/Comfy-Org/MiniMax-H3/resolve/main/diffusion_models/minimax_h3_ref2va_pruned_int8_convrot.safetensors) |
| `lightx2v_I2V_14B_480p_cfg_step_distill_rank64_bf16.safetensors` | `loras` | 0.7 GB | [⬇](https://huggingface.co/Kijai/WanVideo_comfy/resolve/main/Lightx2v/lightx2v_I2V_14B_480p_cfg_step_distill_rank64_bf16.safetensors) |
| `minimax_h3_turbo_v4_step600_ema.safetensors` | `loras` | 0.8 GB | [⬇](https://huggingface.co/larryvrh/MiniMax-H3-Turbo-Lora/resolve/main/minimax_h3_turbo_v4_step600_ema.safetensors) |
| `umt5_xxl_fp8_e4m3fn_scaled.safetensors` | `text_encoders` | 6.7 GB | [⬇](https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged/resolve/main/split_files/text_encoders/umt5_xxl_fp8_e4m3fn_scaled.safetensors) |
| `qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors` ⚡ | `text_encoders` | 15.7 GB | [⬇](https://huggingface.co/Comfy-Org/MiniMax-H3/resolve/main/text_encoders/qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors) |
| `wan_2.1_vae.safetensors` | `vae` | 0.3 GB | [⬇](https://huggingface.co/Comfy-Org/Wan_2.2_ComfyUI_Repackaged/resolve/main/split_files/vae/wan_2.1_vae.safetensors) |
| `minimax_h3_video_vae_int8_convrot.safetensors` | `vae` | 2.8 GB | [⬇](https://huggingface.co/Comfy-Org/MiniMax-H3/resolve/main/vae/minimax_h3_video_vae_int8_convrot.safetensors) |
| `minimax_h3_audio_vae_fp32.safetensors` | `vae` | 0.6 GB | [⬇](https://huggingface.co/Comfy-Org/MiniMax-H3/resolve/main/vae/minimax_h3_audio_vae_fp32.safetensors) |

### 11 · El Embalsamador

| Archivo | Carpeta (`ComfyUI/models/…`) | Tamaño | Descarga |
|---|---|---|---|
| `ema_vae_fp16.safetensors` | `SEEDVR2` | 0.5 GB | [⬇](https://huggingface.co/numz/SeedVR2_comfyUI/resolve/main/ema_vae_fp16.safetensors) |
| `seedvr2_ema_7b_fp8_e4m3fn_mixed_block35_fp16.safetensors` | `SEEDVR2` | 8.5 GB | [⬇](https://huggingface.co/mekrod/seedvr2_ema_7b_fp8_e4m3fn_mixed_block35_fp16/resolve/main/seedvr2_ema_7b_fp8_e4m3fn_mixed_block35_fp16.safetensors) |

### 12 · El Sepulturero

No necesita ningún modelo: solo une tus vídeos con transiciones (nodos de KJNodes). Funciona en cualquier PC.
