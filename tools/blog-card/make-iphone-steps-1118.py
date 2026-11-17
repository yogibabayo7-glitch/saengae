from PIL import Image, ImageDraw, ImageFont
F='/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'; FB='/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc'
def f(s,b=False): return ImageFont.truetype(FB if b else F,s)
BG=(242,242,247); RED=(230,30,40); BLUE=(28,95,212); IOSBLUE=(0,122,255)
W=1000
def screen(title, back, rows_groups, extra=None, h=None):
    H=h or 900; im=Image.new('RGB',(W,H),BG); d=ImageDraw.Draw(im)
    if back: d.text((30,60),'‹ '+back,font=f(34),fill=IOSBLUE,anchor='lm')
    d.text((W//2 if back else 40,60 if back else 75),title,font=f(36 if back else 56,True),fill='black',anchor='mm' if back else 'lm')
    y=130; boxes={}
    for head,rows in rows_groups:
        if head: d.text((60,y+20),head,font=f(26),fill=(110,110,115),anchor='lm'); y+=45
        top=y
        d.rounded_rectangle((30,y,W-30,y+len(rows)*92),24,fill='white')
        for i,(icon,txt,right) in enumerate(rows):
            cy=y+46
            x=60
            if icon:
                d.rounded_rectangle((x,cy-26,x+52,cy+26),12,fill=icon); x+=75
            d.text((x,cy),txt,font=f(34),fill='black',anchor='lm')
            if right=='>' : d.text((W-60,cy),'›',font=f(44),fill=(190,190,195),anchor='mm')
            elif right in('on','off'):
                c=(52,199,89) if right=='on' else (225,225,230)
                d.rounded_rectangle((W-150,cy-28,W-50,cy+28),28,fill=c)
                kx=W-78 if right=='on' else W-122
                d.ellipse((kx-24,cy-24,kx+24,cy+24),fill='white')
            boxes[txt]=(30,y,W-30,y+92)
            if i<len(rows)-1: d.line((x,y+92,W-30,y+92),fill=(225,225,230),width=2)
            y+=92
        y+=40
    if extra: extra(d,y)
    return im,boxes
def mark(im,box,n):
    d=ImageDraw.Draw(im); x0,y0,x1,y1=box
    d.rounded_rectangle((x0-6,y0-6,x1+6,y1+6),26,outline=RED,width=9)
    cx,cy=x1-4,y0+4
    d.ellipse((cx-34,cy-34,cx+34,cy+34),fill=RED,outline='white',width=4)
    d.text((cx,cy-2),n,font=f(40,True),fill='white',anchor='mm')
G=(142,142,147); B=(0,122,255)
s1,b=screen('설정',None,[(None,[((255,149,0),'에어플레인 모드','off'),(B,'Wi-Fi','>'),(B,'Bluetooth','>')]),(None,[(G,'일반','>'),(B,'손쉬운 사용','>'),(B,'디스플레이 및 밝기','>'),((60,170,250),'배경화면','>')])],h=820)
mark(s1,b['손쉬운 사용'],'1')
s2,b=screen('손쉬운 사용','설정',[('시각',[(None,'VoiceOver','>'),(None,'확대/축소','>'),(None,'디스플레이 및 텍스트 크기','>'),(None,'동작','>')]),('일반',[(None,'보조 접근','>')])],h=820)
mark(s2,b['디스플레이 및 텍스트 크기'],'2'); s2b=b['보조 접근']
s3,b=screen('디스플레이 및 텍스트 크기','손쉬운 사용',[(None,[(None,'볼드체 텍스트','off'),(None,'더 큰 텍스트','>'),(None,'버튼 모양','off')])],h=520)
mark(s3,b['더 큰 텍스트'],'3')
def slider(d,y):
    d.rounded_rectangle((30,y,W-30,y+150),24,fill='white')
    d.text((90,y+75),'A',font=f(34,True),fill='black',anchor='mm'); d.text((W-90,y+75),'A',font=f(72,True),fill='black',anchor='mm')
    d.line((140,y+75,W-150,y+75),fill=(200,200,205),width=8); d.line((140,y+75,W-260,y+75),fill=IOSBLUE,width=8)
    for i in range(7): x=140+i*(W-290)//6; d.line((x,y+60,x,y+90),fill=(170,170,175),width=4)
    d.ellipse((W-300,y+40,W-230,y+110),fill='white',outline=(200,200,205),width=3)
    d.text((W//2,y+200),'글씨가 이만큼 커져요',font=f(56,True),fill='black',anchor='mm')
s4,b=screen('더 큰 텍스트','뒤로',[(None,[(None,'더 큰 접근성 크기','on')])],extra=slider,h=650)
d=ImageDraw.Draw(s4); bx=(30,262,W-30,412); mark(s4,bx,'4')
s5,_=screen('손쉬운 사용','설정',[('일반',[(None,'보조 접근','>')])],h=360)
mark(s5,(30,175,W-30,267),'5')
# 합치기
from PIL import Image as I
def card(title,panels,out,foot):
    Wc=1080;pad=40
    H=170+sum(95+p[1].height+45 for p in panels)+70
    c=I.new('RGB',(Wc,H),'white'); dd=ImageDraw.Draw(c)
    dd.rectangle((0,0,Wc,130),fill=BLUE); dd.text((Wc//2,65),title,font=f(52,True),fill='white',anchor='mm')
    y=170
    for lab,im in panels:
        dd.text((pad,y+40),lab,font=f(44,True),fill=(30,30,30),anchor='lm'); y+=95
        c.paste(im,(pad,y)); dd.rectangle((pad,y,pad+im.width,y+im.height),outline=(200,200,200),width=2); y+=im.height+45
    dd.text((Wc//2,H-45),foot,font=f(30),fill=(140,140,140),anchor='mm')
    c.save(out,'WEBP',quality=88,method=6); print(out,c.size)
card('아이폰 글씨 크게 하는 법',[('① [설정] 앱 → [손쉬운 사용]',s1),('② [디스플레이 및 텍스트 크기]',s2),('③ [더 큰 텍스트]',s3),('④ 켜고 막대를 오른쪽으로 밀기',s4),('⑤ 간단 모드: [손쉬운 사용] 맨 아래 [보조 접근]',s5)],'/tmp/gx/C.webp','생애혜택 안내소 · 아이폰 설정 화면을 보기 쉽게 다시 그림')
I.open('/tmp/gx/C.webp').resize((540,None or int(I.open('/tmp/gx/C.webp').height/2))).save('/tmp/gx/C-v.png')
