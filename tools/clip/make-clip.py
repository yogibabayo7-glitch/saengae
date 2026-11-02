from PIL import Image, ImageDraw, ImageFont
import subprocess, os
B='/home/claude/saengae/blog/2026-11-02-기초연금-'
W,H=1080,1920
FB='/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc'
FK='/usr/share/fonts/opentype/noto/NotoSansCJK-Black.ttc'
if not os.path.exists(FB): FB=FK
scenes=[
 ('카드.png','65세 되면\n저절로 나올까요?','기초연금은 신청해야 받습니다',0,6.6),
 ('표3-신청시기.png','65세 생일 달의\n한 달 전부터 신청','늦게 신청하면 그달 연금은 못 받아요',6.6,21.4),
 ('표2-금액.png','혼자 월 최대\n34만 9,700원','부부 둘 다 받으면 합계 55만 9,520원',21.4,32.1),
 ('표4-신청처서류.png','주민센터 · 국민연금공단\n· 복지로에서 신청','신분증 + 본인 통장 / 거동 불편하면 1355',32.1,44.3),
 ('카드.png','자세한 신청법은\n블로그 글에서','↓ 아래 블로그 스티커를 눌러 보세요',44.3,48.8),
]
bg=(255,248,236); accent=(224,122,0); ink=(27,27,31); sub=(90,95,107)
f_big=ImageFont.truetype(FK,78); f_small=ImageFont.truetype(FB,44); f_foot=ImageFont.truetype(FB,34); f_tag=ImageFont.truetype(FK,40)
def frame(i,img,big,small):
    im=Image.new('RGB',(W,H),bg); d=ImageDraw.Draw(im)
    d.rectangle([0,0,W,14],fill=accent)
    # tag
    tag='기초연금 2026'; tw=d.textlength(tag,font=f_tag)
    d.rounded_rectangle([60,70,60+tw+48,70+66],radius=33,fill=accent); d.text((84,78),tag,font=f_tag,fill='white')
    # big caption
    y=170
    for line in big.split('\n'):
        d.text((60,y),line,font=f_big,fill=ink); y+=100
    # image
    src=Image.open(B+img).convert('RGB'); iw=960; ih=int(src.height*iw/src.width)
    maxh=H-y-40-260
    if ih>maxh: ih=maxh; iw=int(src.width*ih/src.height)
    src=src.resize((iw,ih),Image.LANCZOS)
    top=y+40+(maxh-ih)//2; left=(W-iw)//2
    d.rounded_rectangle([left-6,top-6,left+iw+6,top+ih+6],radius=24,fill=(238,230,215))
    im.paste(src,(left,top))
    # small caption box
    sy=H-230; sw=d.textlength(small,font=f_small)
    d.rounded_rectangle([(W-sw)//2-30,sy-16,(W+sw)//2+30,sy+70],radius=18,fill=(255,243,205))
    d.text(((W-sw)//2,sy),small,font=f_small,fill=(92,70,0))
    foot='생애혜택 안내소 · 매주 월·수·금'; fw=d.textlength(foot,font=f_foot)
    d.text(((W-fw)//2,H-110),foot,font=f_foot,fill=sub)
    im.save(f'f{i}.png')
lines=[]
for i,(img,big,small,s,e) in enumerate(scenes):
    frame(i,img,big,small); lines.append(f"file 'f{i}.png'\nduration {e-s:.3f}")
lines.append("file 'f4.png'")
open('list.txt','w').write('\n'.join(lines)+'\n')
subprocess.run(['ffmpeg','-y','-hide_banner','-loglevel','error','-f','concat','-safe','0','-i','list.txt','-i','narration.mp3',
 '-vf','fps=30,format=yuv420p','-c:v','libx264','-preset','medium','-crf','20','-c:a','aac','-b:a','160k','-shortest','-movflags','+faststart','기초연금_클립_11-02.mp4'],check=True)
print('ok')
