# 11/26 사장님이 보내 준 모두의카드 실물 사진 12장을 다듬기: 테두리 잘라내기, 가로 카드는 세로로, 이즐은 노란 카드만 바로 세우기, 둥근 모서리
import sys, numpy as np, cv2
from PIL import Image, ImageDraw
U, OUT = sys.argv[1], sys.argv[2]
src = ['3e09523b','d87c9fea','2915c015','804c7130','2eb0e5be','8218430f','fd14ee02','74de5e92','184db3b0','f939c384','052f373f','a065c18c']
names = ['01-농협','02-신한','03-우리','04-이즐','05-코레일','06-토스뱅크','07-티머니','08-하나','09-IBK','10-KB','11-카카오뱅크','12-케이뱅크']
crop = {0:(1,1,-1,-1),1:(2,1,-2,-2),2:(0,0,0,0),5:(1,14,-1,-13),6:(3,2,-2,-3),7:(1,1,-1,-1),8:(3,2,-3,-4),9:(3,2,-2,-1),10:(2,1,-1,-1),11:(1,1,-1,-1)}
W, H = 400, 634  # 세로 카드(1:1.586)
def rounded(im, r=0.07):
    m = Image.new('L', im.size, 0); ImageDraw.Draw(m).rounded_rectangle((0,0,im.width-1,im.height-1), int(im.width*r), fill=255)
    out = Image.new('RGBA', im.size, (0,0,0,0)); out.paste(im.convert('RGB'), (0,0), m); return out
for i,(s,n) in enumerate(zip(src,names)):
    im = Image.open(f'{U}/{s}-image.png').convert('RGB')
    if i == 3:  # 이즐: 노란 카드만, 기울기 바로잡기, 검은 카드에 가린 오른쪽 아래는 노란색으로 채움
        a = np.asarray(im).copy()
        yel = np.median(a[60:120, 40:90].reshape(-1,3), axis=0).astype(np.uint8)
        hh, ww, _ = a.shape
        for y in range(hh):
            xl = 195 - (y-52)*47/180
            for x in range(ww):
                if x > xl - 6: a[y,x] = yel
        tl, tr, bl = (10.5,31), (128,6), (69,214); br = (tr[0]+bl[0]-tl[0], tr[1]+bl[1]-tl[1])
        M = cv2.getPerspectiveTransform(np.float32([tl,tr,br,bl]), np.float32([[0,0],[W,0],[W,H],[0,H]]))
        im = Image.fromarray(cv2.warpPerspective(a, M, (W,H), flags=cv2.INTER_CUBIC, borderValue=tuple(int(v) for v in yel)))
        b = np.asarray(im).copy(); reg = b[380:, 290:]; light = reg.astype(int).sum(2) > 330; reg[light] = yel; im = Image.fromarray(b)  # 검은 카드 그림자 줄 지우기
    elif i == 4:  # 코레일 Rail+ 는 앱 아이콘 → 정사각 그대로
        im = im.resize((W, W), Image.LANCZOS); rounded(im, 0.22).save(f'{OUT}/{n}.png'); continue
    else:
        l,t,r,b = crop[i]; im = im.crop((l, t, im.width+r if r else im.width, im.height+b if b else im.height))
        if i == 6: im = im.rotate(90, expand=True)    # 티머니 가로 → 세로
        if i == 8: im = im.rotate(-90, expand=True)   # IBK 가로 → 세로(IBK 글자가 바로 읽히게)
        im = im.resize((W, H), Image.LANCZOS)
    rounded(im).save(f'{OUT}/{n}.png'); print(n, im.size)
