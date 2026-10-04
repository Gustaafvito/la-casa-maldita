# La Casa Maldita models

Total without duplicates: **~186 GB**. You don't need everything: download only the models for the rooms you want to use.
If something is missing, the room itself tells you when you enter it ("The ritual is incomplete") with the download link.

Subfolders don't matter: if a model lives in `models/loras/SCAIL/…`, the panel finds it by file name.

⚡ = **NVFP4** format, meant for RTX 50 (Blackwell) GPUs. On other GPUs use the `int8-convrot` or `bf16` version of the
same model (e.g. `gemma4-12b-with-proj-ltx-2.5-comfy-int8-convrot.safetensors` from the official
[Lightricks/LTX-2.5](https://huggingface.co/Lightricks/LTX-2.5) repo) and change it in the workflow's loader node.

🔑 = the repo asks you to log in to Hugging Face and accept the model license before downloading.

Each model's license is listed in [LICENCIAS.md](LICENCIAS.md) (Spanish).

### 01 · The Medium

| File | Folder (`ComfyUI/models/…`) | Size | Download |
|---|---|---|---|
| `krea2_turbo_int8_convrot.safetensors` | `diffusion_models` | 13.5 GB | [⬇](https://huggingface.co/Comfy-Org/Krea-2/resolve/main/diffusion_models/krea2_turbo_int8_convrot.safetensors) |
| `qwen3vl_4b_fp8_scaled.safetensors` | `text_encoders` | 5.2 GB | [⬇](https://huggingface.co/Comfy-Org/Krea-2/resolve/main/text_encoders/qwen3vl_4b_fp8_scaled.safetensors) |
| `qwen_image_vae.safetensors` | `vae` | 0.3 GB | [⬇](https://huggingface.co/Comfy-Org/Krea-2/resolve/main/vae/qwen_image_vae.safetensors) |

### 02 · The Coroner

| File | Folder (`ComfyUI/models/…`) | Size | Download |
|---|---|---|---|
| `seedvr2_ema_3b_fp8_e4m3fn.safetensors` | `SEEDVR2` | 3.4 GB | [⬇](https://huggingface.co/numz/SeedVR2_comfyUI/resolve/main/seedvr2_ema_3b_fp8_e4m3fn.safetensors) |
| `ema_vae_fp16.safetensors` | `SEEDVR2` | 0.5 GB | [⬇](https://huggingface.co/numz/SeedVR2_comfyUI/resolve/main/ema_vae_fp16.safetensors) |

### 03 · The Seamstress

| File | Folder (`ComfyUI/models/…`) | Size | Download |
|---|---|---|---|
| `z_image_turbo_bf16.safetensors` | `diffusion_models` | 12.3 GB | [⬇](https://huggingface.co/Comfy-Org/z_image_turbo/resolve/main/split_files/diffusion_models/z_image_turbo_bf16.safetensors) |
| `qwen_3_4b.safetensors` | `text_encoders` | 8.0 GB | [⬇](https://huggingface.co/Comfy-Org/z_image_turbo/resolve/main/split_files/text_encoders/qwen_3_4b.safetensors) |
| `ae.safetensors` | `vae` | 0.3 GB | [⬇](https://huggingface.co/Comfy-Org/z_image_turbo/resolve/main/split_files/vae/ae.safetensors) |

### 04 · The Puppeteer

| File | Folder (`ComfyUI/models/…`) | Size | Download |
|---|---|---|---|
| `depth_anything_v2_vits.pth` | `(automatic)` | — | downloads automatically |
| `yolox_l.onnx` | `(automatic)` | — | downloads automatically |
| `dw-ll_ucoco_384.onnx` | `(automatic)` | — | downloads automatically |
| `Juggernaut-XL_v9_RunDiffusionPhoto_v2.safetensors` | `checkpoints` | 7.1 GB | [⬇](https://huggingface.co/RunDiffusion/Juggernaut-XL-v9/resolve/main/Juggernaut-XL_v9_RunDiffusionPhoto_v2.safetensors) |
| `controlnet_union_sdxl_promax.safetensors` | `controlnet` | 2.5 GB | [⬇](https://huggingface.co/xinsir/controlnet-union-sdxl-1.0/resolve/main/diffusion_pytorch_model_promax.safetensors) (rename it to `controlnet_union_sdxl_promax.safetensors`) |
| `sdxl_vae.safetensors` | `vae` | 0.3 GB | [⬇](https://huggingface.co/stabilityai/sdxl-vae/resolve/main/sdxl_vae.safetensors) |

### 05 · The Doppelgänger

| File | Folder (`ComfyUI/models/…`) | Size | Download |
|---|---|---|---|
| `flux-2-klein-4b-fp8.safetensors` | `diffusion_models` | 4.1 GB | [⬇](https://huggingface.co/black-forest-labs/FLUX.2-klein-4b-fp8/resolve/main/flux-2-klein-4b-fp8.safetensors) |
| `qwen_3_4b.safetensors` | `text_encoders` | 8.0 GB | [⬇](https://huggingface.co/Comfy-Org/z_image_turbo/resolve/main/split_files/text_encoders/qwen_3_4b.safetensors) |
| `full_encoder_small_decoder.safetensors` | `vae` | 0.2 GB | [⬇](https://huggingface.co/black-forest-labs/FLUX.2-small-decoder/resolve/main/full_encoder_small_decoder.safetensors) |

### 06 · The Nightmare

| File | Folder (`ComfyUI/models/…`) | Size | Download |
|---|---|---|---|
| `LTX-2.5-Distilled-Q3_K_M.gguf` | `diffusion_models` | 12.9 GB | [⬇](https://huggingface.co/Abiray/LTX-2.5-Distilled-GGUF/resolve/main/LTX-2.5-Distilled-Q3_K_M.gguf) |
| `ltx-2.5-latent-spatial-upscaler-x2-bf16-1.0.safetensors` | `latent_upscale_models` | 1.0 GB | [⬇](https://huggingface.co/Lightricks/LTX-2.5/resolve/main/latent_upscale_models/ltx-2.5-latent-spatial-upscaler-x2-bf16-1.0.safetensors) 🔑 |
| `gemma4-12b-with-proj-ltx-2.5-nvfp4.safetensors` ⚡ | `text_encoders` | 11.2 GB | [⬇](https://huggingface.co/Deadshot699/ltx-2.5-gemma4-12b-comfy-nvfp4/resolve/main/text_encoders/gemma4-12b-with-proj-ltx-2.5-nvfp4.safetensors) |
| `gemma_2_2b_it_elm_fp8_scaled.safetensors` | `text_encoders` | 2.6 GB | [⬇](https://huggingface.co/Comfy-Org/PixelDiT/resolve/main/text_encoders/gemma_2_2b_it_elm_fp8_scaled.safetensors) |
| `ltx-2.5-video-vae-bf16.safetensors` | `vae` | 1.5 GB | [⬇](https://huggingface.co/Lightricks/LTX-2.5/resolve/main/vae/ltx-2.5-video-vae-bf16.safetensors) 🔑 |
| `ltx-2.5-audio-vae-bf16.safetensors` | `vae` | 0.4 GB | [⬇](https://huggingface.co/Lightricks/LTX-2.5/resolve/main/vae/ltx-2.5-audio-vae-bf16.safetensors) 🔑 |

### 07 · The Portrait

| File | Folder (`ComfyUI/models/…`) | Size | Download |
|---|---|---|---|
| `LTX-2.5-Distilled-Q3_K_M.gguf` | `diffusion_models` | 12.9 GB | [⬇](https://huggingface.co/Abiray/LTX-2.5-Distilled-GGUF/resolve/main/LTX-2.5-Distilled-Q3_K_M.gguf) |
| `ltx-2.5-latent-spatial-upscaler-x2-bf16-1.0.safetensors` | `latent_upscale_models` | 1.0 GB | [⬇](https://huggingface.co/Lightricks/LTX-2.5/resolve/main/latent_upscale_models/ltx-2.5-latent-spatial-upscaler-x2-bf16-1.0.safetensors) 🔑 |
| `gemma_2_2b_it_elm_fp8_scaled.safetensors` | `text_encoders` | 2.6 GB | [⬇](https://huggingface.co/Comfy-Org/PixelDiT/resolve/main/text_encoders/gemma_2_2b_it_elm_fp8_scaled.safetensors) |
| `gemma4-12b-with-proj-ltx-2.5-nvfp4.safetensors` ⚡ | `text_encoders` | 11.2 GB | [⬇](https://huggingface.co/Deadshot699/ltx-2.5-gemma4-12b-comfy-nvfp4/resolve/main/text_encoders/gemma4-12b-with-proj-ltx-2.5-nvfp4.safetensors) |
| `ltx-2.5-video-vae-bf16.safetensors` | `vae` | 1.5 GB | [⬇](https://huggingface.co/Lightricks/LTX-2.5/resolve/main/vae/ltx-2.5-video-vae-bf16.safetensors) 🔑 |
| `ltx-2.5-audio-vae-bf16.safetensors` | `vae` | 0.4 GB | [⬇](https://huggingface.co/Lightricks/LTX-2.5/resolve/main/vae/ltx-2.5-audio-vae-bf16.safetensors) 🔑 |

### 08 · The Exorcist

| File | Folder (`ComfyUI/models/…`) | Size | Download |
|---|---|---|---|
| `rife47.pth` | `(automatic)` | — | downloads automatically |
| `minimax_h3_ref2va_pruned_int8_convrot.safetensors` | `diffusion_models` | 21.0 GB | [⬇](https://huggingface.co/Comfy-Org/MiniMax-H3/resolve/main/diffusion_models/minimax_h3_ref2va_pruned_int8_convrot.safetensors) |
| `minimax_h3_turbo_v4_step600_ema.safetensors` | `loras` | 0.8 GB | [⬇](https://huggingface.co/larryvrh/MiniMax-H3-Turbo-Lora/resolve/main/minimax_h3_turbo_v4_step600_ema.safetensors) |
| `qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors` ⚡ | `text_encoders` | 15.7 GB | [⬇](https://huggingface.co/Comfy-Org/MiniMax-H3/resolve/main/text_encoders/qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors) |
| `minimax_h3_video_vae_int8_convrot.safetensors` | `vae` | 2.8 GB | [⬇](https://huggingface.co/Comfy-Org/MiniMax-H3/resolve/main/vae/minimax_h3_video_vae_int8_convrot.safetensors) |
| `minimax_h3_audio_vae_fp32.safetensors` | `vae` | 0.6 GB | [⬇](https://huggingface.co/Comfy-Org/MiniMax-H3/resolve/main/vae/minimax_h3_audio_vae_fp32.safetensors) |
| `taeh3.safetensors` | `vae_approx` | 0.0 GB | [⬇](https://huggingface.co/OzzyGT/taeh3/resolve/main/taeh3.safetensors) |

### 09 · The Possessed

| File | Folder (`ComfyUI/models/…`) | Size | Download |
|---|---|---|---|
| `rife47.pth` | `(automatic)` | — | downloads automatically |
| `sam3.1_multiplex_fp16.safetensors` | `checkpoints` | 1.7 GB | [⬇](https://huggingface.co/Comfy-Org/sam3.1/resolve/main/checkpoints/sam3.1_multiplex_fp16.safetensors) |
| `clip_vision_h.safetensors` | `clip_vision` | 1.3 GB | [⬇](https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged/resolve/main/split_files/clip_vision/clip_vision_h.safetensors) |
| `wan2.1_14B_SCAIL_2_int8_convrot.safetensors` | `diffusion_models` | 16.7 GB | [⬇](https://huggingface.co/Comfy-Org/SCAIL-2/resolve/main/diffusion_models/wan2.1_14B_SCAIL_2_int8_convrot.safetensors) |
| `wan2.1_SCAIL_2_DPO_lora_bf16.safetensors` | `loras` | 1.2 GB | [⬇](https://huggingface.co/Comfy-Org/SCAIL-2/resolve/main/loras/wan2.1_SCAIL_2_DPO_lora_bf16.safetensors) |
| `lightx2v_I2V_14B_480p_cfg_step_distill_rank64_bf16.safetensors` | `loras` | 0.7 GB | [⬇](https://huggingface.co/Kijai/WanVideo_comfy/resolve/main/Lightx2v/lightx2v_I2V_14B_480p_cfg_step_distill_rank64_bf16.safetensors) |
| `umt5_xxl_fp8_e4m3fn_scaled.safetensors` | `text_encoders` | 6.7 GB | [⬇](https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged/resolve/main/split_files/text_encoders/umt5_xxl_fp8_e4m3fn_scaled.safetensors) |
| `wan_2.1_vae.safetensors` | `vae` | 0.3 GB | [⬇](https://huggingface.co/Comfy-Org/Wan_2.2_ComfyUI_Repackaged/resolve/main/split_files/vae/wan_2.1_vae.safetensors) |

### 10 · The Ouija

| File | Folder (`ComfyUI/models/…`) | Size | Download |
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

### 11 · The Embalmer

| File | Folder (`ComfyUI/models/…`) | Size | Download |
|---|---|---|---|
| `ema_vae_fp16.safetensors` | `SEEDVR2` | 0.5 GB | [⬇](https://huggingface.co/numz/SeedVR2_comfyUI/resolve/main/ema_vae_fp16.safetensors) |
| `seedvr2_ema_7b_fp8_e4m3fn_mixed_block35_fp16.safetensors` | `SEEDVR2` | 8.5 GB | [⬇](https://huggingface.co/mekrod/seedvr2_ema_7b_fp8_e4m3fn_mixed_block35_fp16/resolve/main/seedvr2_ema_7b_fp8_e4m3fn_mixed_block35_fp16.safetensors) |

### 12 · The Gravedigger

Needs no model at all: it just joins your videos with transitions (KJNodes nodes). Runs on any PC.
