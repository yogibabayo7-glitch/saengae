import cv2, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
U='/mnt/user-data/uploads/'
F='/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc'
def font(s): return ImageFont.truetype(F,s)
BLUE=(28,95,212); RED=(230,30,40)
def clean(path, keep=[]):
    im=cv2.imread(U+path)
    b,g,r=cv2.split(im.astype(int))
    m=((r>170)&(g<90)&(b<100)).astype(np.uint8)*255
    for x0,y0,x1,y1 in keep: m[y0:y1,x0:x1]=0
    m=cv2.dilate(m,np.ones((9,9),np.uint8))
    out=cv2.inpaint(im,m,7,cv2.INPAINT_TELEA)
    return Image.fromarray(cv2.cvtColor(out,cv2.COLOR_BGR2RGB))
def home():
    im=clean('f0521dff-image.jpg',keep=[(820,320,1010,490),(570,600,760,790),(820,1150,1010,1300),(320,1420,510,1600),(570,1420,760,1600)])
    bl=im.filter(ImageFilter.GaussianBlur(45))
    mask=Image.new('L',im.size,0); d=ImageDraw.Draw(mask)
    for (x,y) in [(165,140),(415,140),(665,140),(915,140),(165,415),(415,415),(665,415),(915,415)]:
        d.rounded_rectangle((x-90,y-90,x+90,y+90),40,fill=255)
    mask=mask.filter(ImageFilter.GaussianBlur(3))
    out=Image.composite(im,bl,mask); dd=ImageDraw.Draw(out)
    # 라벨은 흐린 바탕 위에 새로 씀
    for (x,y),t in zip([(165,258),(415,258),(665,258),(915,258),(165,531),(415,531),(665,531),(915,531)],['고용노동부','내 파일','레벨업스쿨','모의투자하기','Google','계산기','설정','스토어']):
        dd.text((x,y),t,font=font(34),fill='white',anchor='mm',stroke_width=2,stroke_fill=(40,40,40))
    return out.crop((0,40,1080,580))
def mark(im, box, n):
    d=ImageDraw.Draw(im); x0,y0,x1,y1=box
    d.rounded_rectangle(box,28,outline=RED,width=9)
    cx,cy=x1-10,y0+10
    d.ellipse((cx-34,cy-34,cx+34,cy+34),fill=RED,outline='white',width=4)
    d.text((cx,cy-2),n,font=font(40),fill='white',anchor='mm')
    return im
def card(title, panels, out):
    W=1080; pad=40; pw=W-2*pad
    rows=[]
    for lab,img in panels:
        img=img.resize((pw,int(img.height*pw/img.width)))
        rows.append((lab,img))
    H=170+sum(110+r[1].height+30 for r in rows)+70
    c=Image.new('RGB',(W,H),'white'); d=ImageDraw.Draw(c)
    d.rectangle((0,0,W,130),fill=BLUE)
    d.text((W//2,65),title,font=font(52),fill='white',anchor='mm')
    y=170
    for lab,img in rows:
        d.text((pad,y+40),lab,font=font(44),fill=(30,30,30),anchor='lm'); y+=95
        c.paste(img,(pad,y)); d.rectangle((pad,y,pad+pw,y+img.height),outline=(200,200,200),width=2)
        y+=img.height+45
    d.text((W//2,H-45),'생애혜택 안내소 · 갤럭시 실제 화면',font=font(30),fill=(140,140,140),anchor='mm')
    c.save(out,'WEBP',quality=88,method=6); print(out,c.size)
# A 쉬운 사용 모드
a1=mark(home(),(560,270,770,535),'1')
a2=clean('1a3ccf06-image.jpg').crop((0,380,1080,900)); a2=mark(a2,(35,215,1045,355),'2')
a3=clean('6d62e6eb-image.jpg').crop((0,1080,1080,1800)); a3=mark(a3,(35,275,1045,415),'3')
a4=clean('c884e0b5-image.jpg').crop((0,40,1080,930)); a4=mark(a4,(35,690,1045,870),'4')
card('갤럭시 쉬운 사용 모드 켜는 법',[('① 톱니바퀴 [설정] 앱 누르기',a1),('② [디스플레이] 누르기',a2),('③ 아래로 내려 [쉬운 사용 모드] 누르기',a3),('④ 오른쪽 단추를 눌러 켜기 (파란색)',a4)],'/tmp/gx/A.webp')
# B 글자 크기
b1=clean('ca27644d-image.jpg').crop((0,680,1080,1260)); b1=mark(b1,(35,290,1045,430),'3')
def slide(p):
    im=clean(p); top=im.crop((0,170,1080,820)); bot=im.crop((0,1880,1080,2090))
    c=Image.new('RGB',(1080,top.height+bot.height),'black'); c.paste(top,(0,0)); c.paste(bot,(0,top.height)); return c
b2=slide('2807806f-image.jpg'); b3=slide('9ddab614-image.jpg')
b3=mark(b3,(560,650,1060,860),'4')
pair=Image.new('RGB',(2200,b2.height+90),'white'); dp=ImageDraw.Draw(pair)
pair.paste(b2,(0,90)); pair.paste(b3,(1120,90))
dp.text((540,45),'바꾸기 전',font=font(60),fill=(90,90,90),anchor='mm'); dp.text((1660,45),'오른쪽 끝으로 밀면',font=font(60),fill=RED,anchor='mm')
card('갤럭시 글자 크기 키우는 법',[('③ [설정]→[디스플레이] 다음 [글자 크기와 스타일]',b1),('④ 아래 막대의 동그라미를 오른쪽으로 밀기',pair)],'/tmp/gx/B.webp')
