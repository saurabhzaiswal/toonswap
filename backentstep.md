1. FFmpeg install karo

Codespace mein ye command run karo:

sudo apt update
sudo apt install -y ffmpeg


ffmpeg -version

FFmpeg ek media-processing software/tool hai jo project mein video aur audio ko create, convert, edit aur process karne ke kaam aata hai.

Aapke ToonSwap project mein iska main kaam likely:

🎬 Uploaded/images se video render karna
🖼️ Images ko video frames mein convert/process karna
🎵 Audio/voice ko video ke saath combine karna
✍️ drawtext ke through video par text/captions lagana
🔄 Video formats/resolutions convert karna
🎞️ Final rendered ToonSwap video generate karna

Aapki guide mein specifically likha hai:

FFmpeg with the drawtext filter

Iska matlab ToonSwap ka video-rendering system FFmpeg ko command-line tool ke roop mein use karta hai.

Simple example: agar ToonSwap ko 5 images + voice/audio se ek animated/story video banana hai, backend FFmpeg ko use karke un media files ko process karke final MP4 bana sakta hai.

---

docker run --name toonswap-postgres \
  -e POSTGRES_USER=toonswap \
  -e POSTGRES_PASSWORD=toonswap_dev \
  -e POSTGRES_DB=toonswap \
  -p 5432:5432 \
  -v toonswap-postgres-data:/var/lib/postgresql/data \
  -d postgres:18-alpine
Unable to find image 'postgres:18-alpine' locally
18-alpine: Pulling from library/postgres
55afa1ecc21d: Pull complete 
8c4cf0b70797: Pull complete 
21225587b6ee: Pull complete 
d5392b8b2486: Pull complete 
d5c3772878da: Pull complete 
c789cfcee1a8: Pull complete 
76b8b44efa5a: Pull complete 
9530417d1dbb: Pull complete 
c24407d2ec97: Pull complete 
32a5a1abaaf0: Download complete 
71608f5c0921: Download complete 
Digest: sha256:9a8afca54e7861fd90fab5fdf4c42477a6b1cb7d293595148e674e0a3181de15
Status: Downloaded newer image for postgres:18-alpine
fa6ed2fb78f452cbb993182299a353ceb5c8fbd0a5c24112345d467158276741


docker exec toonswap-postgres pg_isready -U toonswap -d toonswap

if  issue  run : docker logs toonswap-postgres

 docker run --name toonswap-postgres \
  -e POSTGRES_USER=toonswap \
  -e POSTGRES_PASSWORD=toonswap_dev \
  -e POSTGRES_DB=toonswap \
  -p 5432:5432 \
  -v toonswap-postgres-data:/var/lib/postgresql \
  -d postgres:18-alpine

  docker exec toonswap-postgres psql -U toonswap -d toonswap -c "SELECT version();"

  ---

  docker run --name toonswap-redis \
  -p 6379:6379 \
  -v toonswap-redis-data:/data \
  -d redis:7-alpine redis-server --appendonly yes

  docker exec toonswap-redis redis-cli ping 

  ---

  chmod +x .devcontainer/setup.sh
chmod +x .devcontainer/start.sh