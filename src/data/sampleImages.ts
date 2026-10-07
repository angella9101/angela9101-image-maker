import { UploadedImage } from '../types';

export function generateSampleImages(): UploadedImage[] {
  const samples: UploadedImage[] = [];

  // Sample 1: Old Photo for Restoration / Colorize / Upscale / Life Album
  const canvas1 = document.createElement('canvas');
  canvas1.width = 600;
  canvas1.height = 800;
  const ctx1 = canvas1.getContext('2d')!;

  const grad1 = ctx1.createLinearGradient(0, 0, 0, 800);
  grad1.addColorStop(0, '#38332b');
  grad1.addColorStop(0.5, '#6e675b');
  grad1.addColorStop(1, '#24201a');
  ctx1.fillStyle = grad1;
  ctx1.fillRect(0, 0, 600, 800);

  // Scratches & vintage grain
  ctx1.fillStyle = 'rgba(255, 255, 255, 0.12)';
  for (let i = 0; i < 400; i++) {
    ctx1.fillRect(Math.random() * 600, Math.random() * 800, 2, 2);
  }

  // Portrait head
  ctx1.fillStyle = '#c7beae';
  ctx1.beginPath();
  ctx1.arc(300, 330, 140, 0, Math.PI * 2);
  ctx1.fill();

  // Shoulders
  ctx1.beginPath();
  ctx1.ellipse(300, 660, 220, 180, 0, 0, Math.PI * 2);
  ctx1.fill();

  // Eyes & Features
  ctx1.fillStyle = '#453f35';
  ctx1.beginPath();
  ctx1.arc(250, 320, 16, 0, Math.PI * 2);
  ctx1.arc(350, 320, 16, 0, Math.PI * 2);
  ctx1.fill();

  ctx1.font = 'bold 22px sans-serif';
  ctx1.fillStyle = '#f59e0b';
  ctx1.textAlign = 'center';
  ctx1.fillText('[샘플 1: 오래된 인물 사진]', 300, 60);

  samples.push({
    id: 'sample_old_portrait',
    dataUrl: canvas1.toDataURL('image/png'),
    name: '오래된_인물_사진_샘플.png',
    role: 'SOURCE',
  });

  // Sample 2: Snap Portrait for Passport / Studio / Skin Retouch / Synthesis
  const canvas2 = document.createElement('canvas');
  canvas2.width = 600;
  canvas2.height = 800;
  const ctx2 = canvas2.getContext('2d')!;

  const grad2 = ctx2.createRadialGradient(300, 300, 100, 300, 400, 500);
  grad2.addColorStop(0, '#38bdf8');
  grad2.addColorStop(1, '#0f172a');
  ctx2.fillStyle = grad2;
  ctx2.fillRect(0, 0, 600, 800);

  ctx2.fillStyle = '#fde047';
  ctx2.beginPath();
  ctx2.arc(300, 330, 145, 0, Math.PI * 2);
  ctx2.fill();

  ctx2.fillStyle = '#1e293b';
  ctx2.beginPath();
  ctx2.ellipse(300, 680, 230, 190, 0, 0, Math.PI * 2);
  ctx2.fill();

  ctx2.fillStyle = '#0f172a';
  ctx2.beginPath();
  ctx2.arc(245, 320, 18, 0, Math.PI * 2);
  ctx2.arc(355, 320, 18, 0, Math.PI * 2);
  ctx2.fill();

  ctx2.font = 'bold 22px sans-serif';
  ctx2.fillStyle = '#ffffff';
  ctx2.textAlign = 'center';
  ctx2.fillText('[샘플 2: 스냅 프로필 사진]', 300, 60);

  samples.push({
    id: 'sample_snap_portrait',
    dataUrl: canvas2.toDataURL('image/png'),
    name: '스냅_프로필_사진_샘플.png',
    role: 'COMPOSITE',
  });

  return samples;
}

export const PRESET_IDEA_SUGGESTIONS = [
  '배경을 밝은 스튜디오로 바꿔줘',
  '이 사람에게 검은색 정장을 입혀줘',
  '흑백사진을 자연스럽게 컬러화해줘',
  '얼굴은 그대로 유지하고 30대 모습으로 만들어줘',
  '두 번째 사진의 인물을 첫 번째 사진 옆에 자연스럽게 합성해줘',
  '얼굴 트러블과 잡티를 자연스럽게 보정해줘',
];
