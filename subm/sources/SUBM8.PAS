{$A+,B-,D+,E+,F-,G-,I+,L+,N-,O-,P-,Q+,R+,S+,T-,V+,X+}
{$M 8384,0,655360}
program subm8;
  uses graph,crt,dos;
const max=33;nn=15;mm=10;bb=75;sssr=80;
maxx=26;
maxxx=129;
cnll:array [1..maxxx] of word=(
220,233,262,262,262,262,262,220,196,220,175,175,175,175,175,175,196,220,196
,175,147,147,147,175,196,220,196,196,196,196,196,196,220,233,262,262,262
,262,262,220,196,220,175,175,175,175,175,175,196,220,196,175,147,147,147
,175,196,220,196,196,196,196,196,196,196,196,262,294,262,294,262,294,262
,294,196,196,196,220,196,196,196,196,220,196,196,220,196,196,196,196,175
,175,175,196,175,175,175,175,262,294,262,294,262,294,262,294,196,196,196
,220,196,196,196,196,220,196,196,220,196,196,196,196,175,175,175,196,175
,175,65);
cnl:array [1..maxx] of word=(
220,165,131,220,165,131,220,165,131,262,247,207,247,220,165,247,207,165,220
,165,131,110,110,110,110,110);
SizeEnemy:array[1..2,34..36] of byte=((22,20,35),(28,12,15));
type
tmass=record
      dx,dy:integer;
      x,y,ox,oy:array[0..1]of integer;
      tip:byte;
      pox,poy:integer;
      num:byte;
      opic:array[0..1] of pointer;
     end;
tm=array[1..3] of tmass;
tar1=array[1..8,34..36] of pointer;
tar=array[1..10] of pointer;
tekr=array[0..39,0..34] of integer;
tkar=array[-5..max] of pointer;
var
  old1c:pointer;
  mus,pause:integer;
  zas:array[0..3,0..7] of integer;
  kamx:integer;gha,keyekr:boolean;
  colkam:byte;
  kamy:array[0..1,0..3] of integer;
  kamni:boolean;
  o,u1,z,w:pointer;
  ss:string;
  massv:tm;pic:tar1;
  ekr:tekr;fl:array[0..1]of boolean;
  page,u,stage,coltor,colos,colfi,colak,col,e1,e2,ko2:byte;
  x,y,racox,racoy:array[0..1]of integer;
  torp:array[0..1,-1..1] of pointer;
  c:char;opis:array[0..1]of pointer;
  bom:array[0..1]of pointer;
  sp,s,gd,gm,a,saq,b,next,x2,y2,tt,score,boj,boi,kolasdf:integer;
  nd,x1,y1,dx,dy,yy,yr,ddy,kolo2,kk,dy1,akx,i,qq,j,i1,j1,k,dxx,ds,dyy,kolline:integer;
  size:word;
  sub:array[-2..7] of pointer;
  kam,bomb:pointer;
  racx,racy,drac:integer;
  kar:tkar;key,o2,ww,box,bomb1,rac,rac1:boolean;
  vzr,mskvzr:tar;
  zader,keyx,keyy,keyi,keyj,o2x,o2y,o2i,o2j,bx,by,bi,bj:integer;
  f:file;fil:text;
  viv:string[10];

procedure WaitVBL;
label ALTO,BASSO;
 begin
  asm
   mov  dx,$03da
   BASSO:
   in   al,dx
   test al,8
   jz   BASSO
   ALTO:
   in   al,dx
   test al,8
   jnz  ALTO
  end;
 end;

procedure Music1;interrupt;
begin
  inc(pause);
  if pause=5 then   {<<<<<-----pause=ß†§•‡¶™†}
  begin
    sound(cnll[mus]);
    inc(mus);
    pause:=1;
  end;
  if mus>=maxxx then mus:=1;
end;
procedure Music;interrupt;
begin
  inc(pause);
  if pause=6 then   {<<<<<-----pause=ß†§•‡¶™†}
  begin
    sound(cnl[mus]);
    inc(mus);
    pause:=1;
  end;
  if mus>=maxx then mus:=1;
end;
procedure vzr1(a,b:integer;vzr,mskvzr:tar;flag:boolean;d:byte);
var
 j:integer;
begin
 for j:=1 to 8 do
 begin
    setvisualpage(page);
    setactivepage(page);
  putimage(a+22,b+2,mskvzr[j]^,andput);
  putimage(a+22,b+2,vzr[j]^,XORput);
  delay(100);
 end;
 if flag then gha:=true else begin
 case massv[i].tip of
 34:begin colos:=colos+1; score:=score+10;end;
 35:begin colfi:=colfi+1;score:=score+15;end;
 36:begin colak:=colak+1;score:=score+20;end;
 end;
      for j:=0 to 1 do begin
         setactivepage(j);
     setfillstyle(1,8);
     bar(496+nn,200+mm,640,285+mm);
     str(colfi,viv);
      outtextxy(496+nn,200+mm,'  êõÅ-'+viv);
       str(colak,viv);
      outtextxy(496+nn,225+mm,'  Ääìã-'+viv);
       str(colos,viv);
      outtextxy(496+nn,250+mm,'  éëåàçéÉéÇ-'+viv);
       str(score,viv);
         outtextxy(496+nn,275+mm,'éóäà-'+viv);
         putimage(massv[i].x[page],massv[i].y[page],massv[i].opic[page]^,normalput);
      end;
      massv[i]:=massv[col-1];
      col:=col-1;
 end;
 if d=1 then gha:=false;
end;
procedure vivod(kar:tkar;ekr:tekr;var massv:tm;var col:byte;e1,e2:byte);
var
 i,j:integer;
begin
 col:=1;kamni:=false;bomb1:=false;o2:=false;box:=false;keyekr:=false;
 for i:=e2 to e2+9 do
  for j:=e1 to e1+6 do begin
  case ekr[i,j]of
  35:begin
    massv[col].tip:=35;massv[col].oy[1]:=(i-e2)*32;massv[col].oy[0]:=(i-e2)*32;massv[col].ox[1]:=(j-e1)*72;
    massv[col].ox[0]:=(j-e1)*72;massv[col].num:=1;col:=col+1;
    ekr[i,j]:=0;
    end;
  34:begin
    massv[col].tip:=34;massv[col].oy[1]:=(i-e2)*32;massv[col].ox[1]:=(j-e1)*72;
    massv[col].oy[0]:=(i-e2)*32;massv[col].ox[0]:=(j-e1)*72;massv[col].num:=1;col:=col+1;
    ekr[i,j]:=0;
    end;
   36:begin
    massv[col].tip:=36;massv[col].oy[1]:=(i-e2)*32;massv[col].oy[0]:=(i-e2)*32;massv[col].ox[1]:=(j-e1)*72;
    massv[col].ox[0]:=(j-e1)*72;massv[col].num:=1;col:=col+1;
    ekr[i,j]:=0;
    end;
   4:begin putimage((j-e1)*72,(i-e2)*32,kar[0]^,normalput);
    boj:=(j-e1)*72;boi:=(i-e2)*32;bomb1:=true;end;
    7:begin putimage((j-e1)*72,(i-e2)*32,kar[-1]^,normalput);
     putimage((j-e1)*72,(i-e2)*32+8,kar[7]^,normalput);
     keyx:=j*72;keyy:=i*32+8;keyi:=i;keyj:=j;key:=true;keyekr:=true;
    end;
    2:begin putimage((j-e1)*72,(i-e2)*32,kar[-1]^,normalput);
     putimage((j-e1)*72,(i-e2)*32,kar[2]^,normalput);
     o2x:=j*72;o2y:=i*32;o2i:=i;o2j:=j;o2:=true;
    end;
    33:begin putimage((j-e1)*72,(i-e2)*32,kar[-1]^,normalput);
     putimage((j-e1)*72,(i-e2)*32,kar[33]^,normalput);
     bx:=j*72;by:=i*32;bi:=i;bj:=j;box:=true;end;
     3:begin
       kamni:=true;
       kamx:=(j-e1)*72;
       colkam:=3;end;
   end;
    if ekr[i,j]<Max
    then putimage((j-e1)*72,(i-e2)*32,kar[ekr[i,j]]^,normalput);
  end;
  if kamni then
   for i:=0 to colkam do
    for j:=0 to 1 do
    begin
     kamy[j,i]:=i*94;
     setactivepage(j);
     putimage(kamx,kamy[j,i],kar[3]^,normalput);
    end;
 for i:=1 to col-1 do
  for j:=0 to 1 do begin
   getimage(massv[i].ox[j],massv[i].oy[j],massv[i].ox[j]+72,massv[i].oy[j]+64,massv[i].opic[j]^);
   massv[i].x[j]:=massv[i].ox[j];
  massv[i].y[j]:=massv[i].oy[j];
  end;
end;
procedure perehod(ekr:tekr;var a,b,dx,dy:integer;var massv:tm;var col,e1,e2:byte);
var pag:byte;
begin
 if (dx>0)and(a+72>=503)then begin e1:=e1+7;a:=1;
 rac:=false;rac1:=false;
 for pag:=0 to 1 do begin
   setactivepage(pag);
   setvisualpage(1-pag);
   vivod(kar,ekr,massv,col,e1,e2);
   x[pag]:=a;
    getimage(a,b,a+72,b+32,opis[pag]^);
    end;
 end;
 if (dx<0)and(a<=1)then begin e1:=e1-7;a:=504-73;rac:=false;rac1:=false;
 for pag:=0 to 1 do begin
   setactivepage(pag);
   setvisualpage(1-pag);
   vivod(kar,ekr,massv,col,e1,e2);
   x[pag]:=a;
   getimage(a,b,a+72,b+32,opis[pag]^);
  end;
 end;
 if (dy<0)and(b<=1)then begin e2:=e2-10;b:=320-33;rac:=false;rac1:=false;
 for pag:=0 to 1 do begin
   setactivepage(pag);
   setvisualpage(1-pag);
   vivod(kar,ekr,massv,col,e1,e2);
   y[pag]:=b;
   getimage(a,b,a+72,b+32,opis[pag]^);
  end;
 end;
 if (dy>0)and(b+32>=319)then begin e2:=e2+10;b:=1;rac:=false;rac1:=false;
 for pag:=0 to 1 do begin
   setactivepage(pag);
   setvisualpage(1-pag);
   vivod(kar,ekr,massv,col,e1,e2);
   y[pag]:=b;
   getimage(a,b,a+72,b+32,opis[pag]^);
  end;
 end;
end;
procedure gran;
var
 ppp,ppp1,ppp2,ppp3,ppp4,ppp5:word;
begin
 {ppp:=getpixel(a-1,b-1);
  ppp1:=getpixel(a-1,b+33); ppp2:=getpixel(a+73,b-1);
   ppp3:=getpixel(a+73,b+33);
 ppp4:=getpixel(a+33,b-1);ppp5:=getpixel(a+33,b+33);
 if ((ppp<>9)and(ppp<>2))or((ppp1<>9)and(ppp1<>2))or((ppp2<>9)and(ppp2<>2))or((ppp3<>9)and(ppp3<>2))
 or((ppp4<>9)and(ppp4<>2))or((ppp5<>9)and(ppp5<>2)) then
  vzr1(a,b,vzr,mskvzr,true,0)}
 if dx>0 then j1:=(a div 72)+1
 else j1:=a div 72;
 if dy>0 then begin i1:=(b div 32)+1;dy1:=2;end
 else begin i1:=b div 32;dy1:=-2;end;
  next:=ekr[i1+e2,j1+e1];
  case next of
   11..14,19,20,26,27,-5,-4:if a*dx>dx*(j1*72-dx*44) then vzr1(a,b,vzr,mskvzr,true,0);
   15,16:begin if a*dx>dx*(j1*72-dx*72) then vzr1(a,b,vzr,mskvzr,true,0);
    if b*dy1/2>dy1/2*(i1*32-dy1*16) then vzr1(a,b,vzr,mskvzr,true,0);end;
   1,5,8,9,21,23,32:if b*dy1/2>dy1/2*(i1*32-dy1*16) then vzr1(a,b,vzr,mskvzr,true,0);
   17,18,24,25,28..31:begin if a*dx>dx*(j1*72-dx*44) then vzr1(a,b,vzr,mskvzr,true,0);
    if (b*dy1/2>dy1/2*(i1*32-dy1*16))and(a*dx>dx*(j1*72-dx*44)) then vzr1(a,b,vzr,mskvzr,true,0);end;
  end;
end;
procedure prov(xx,yy,xxx,yyy:integer);
begin
 setfillstyle(1,9);
 bar(xx-(e1*72),yy-(e2*32),xx-(e1*72)+xxx,yy-(e2*32)+yyy);
 setactivepage(1-page);
 bar(xx-(e1*72),yy-(e2*32),xx-(e1*72)+xxx,yy-(e2*32)+yyy);
 setactivepage(1-page);
end;
procedure provvz;
var
 g,h:real;
begin
 g:=32+sizeenemy[1,massv[i].tip];
 h:=16+sizeenemy[2,massv[i].tip];
 if abs(a+36-sizeenemy[1,massv[i].tip]-massv[i].ox[page])<g then
  if abs(b+16-sizeenemy[2,massv[i].tip]-massv[i].oy[page])<h then
   vzr1(a,b,vzr,mskvzr,true,0);
end;
procedure provrac;
begin
 if ((drac>0)and(racx+30>=504))or((drac<0)and(racx<=0))then begin
  rac:=false;
  setfillstyle(1,9);
  for i:=0 to 1 do begin
   setactivepage(i);
   bar(racox[i],racy,racox[i]+30,racy+9);end;end;
if racy>=298 then begin
  rac1:=false;
  setfillstyle(1,9);
  for i:=0 to 1 do begin
   setactivepage(i);
   bar(racx,racoy[i],racx+9,racoy[i]+22);end;end;
end;
procedure provvzrac(var tor,tor1:boolean);
var
 g,h,x,y:real;
begin
 if col<>1 then begin
 if tor then begin
   g:=15+sizeenemy[1,massv[i].tip];
   h:=4.5+sizeenemy[2,massv[i].tip];
   x:=racx;y:=racy;
 end
 else begin
   g:=11+sizeenemy[1,massv[i].tip];
   h:=4.5+sizeenemy[2,massv[i].tip];
   x:=racx;y:=racy;
 end;
 if abs(x+(g-sizeenemy[1,massv[i].tip] )-sizeenemy[1,massv[i].tip]-massv[i].ox[page])<g then
  if abs(y+(h-sizeenemy[2,massv[i].tip])-sizeenemy[2,massv[i].tip]-massv[i].oy[page])<h then begin
 vzr1(massv[i].ox[page]-15,massv[i].oy[page],vzr,mskvzr,false,0);setfillstyle(1,9);
 for i:=0 to 1 do begin
            setactivepage(i);
            if tor then
            bar(racox[i],racy,racox[i]+30,racy+9);
            if tor1 then
            bar(racx,racoy[i],racx+9,racoy[i]+22);
          end;
  if tor then tor:=false else tor1:=false;
  end;
 end;
end;
procedure LoadFon;
begin
   assign(f,'key1.spr');
   reset(f,1);
   blockread(f,x,2);
   blockread(f,y,2);
   blockread(f,size,2);
   getmem(w,size);
   blockread(f,w^,size);
   close(f);
   assign(f,'minus.spr');
   reset(f,1);
   blockread(f,x,2);
   blockread(f,y,2);
   blockread(f,size,2);
   getmem(o,size);
   blockread(f,o^,size);
   close(f);
   assign(f,'plus.spr');
   reset(f,1);
   blockread(f,x,2);
   blockread(f,y,2);
   blockread(f,size,2);
   getmem(u1,size);
   blockread(f,u1^,size);
  close(f);
end;
procedure ramka;
begin
 setcolor(15);
 line(0,320,504,320);
 line(504,0,504,320);
 setcolor(7);
 line(0,321,504,321);
 line(505,0,505,321);
  setcolor(6);
 line(0,322,504,322);
 line(506,0,506,322);
 setcolor(2);
end;
procedure InterFon;
begin
setfillstyle(1,8);
  bar(504,93,640,350);
  bar(0,320,640,350);
  setcolor(2);
  setfillstyle(1,9);
  settextstyle(0,0,1);
 outtextxy(496+nn,100+mm,'ìêéÇÖçú-1');
 outtextxy(496+nn,125+mm, 'íéêèÖÑõ-5');
 outtextxy(496+nn,150+mm,'ëäéêéëíú-0');
 outtextxy(496+nn,175+mm,'ìÅàíé:');
 outtextxy(496+nn,200+mm,'  êõÅ-0');
 outtextxy(496+nn,225+mm,'  Ääìã-0');
 outtextxy(496+nn,250+mm,'  éëåàçéÉéÇ-0');
 outtextxy(496+nn,275+mm,'éóäà-0');
 outtextxy(310+nn,332,'äàëãéêéÑ-100%');
 putimage(496+nn,290+mm,w^,normalput);
 putimage(540+nn,298+mm,o^,normalput);
 ramka;
end;
procedure pstage;
begin
 if dx>0 then j1:=(a div 72)+1
  else j1:=a div 72;
 if dy>0 then i1:=(b div 32)+1
  else i1:=b div 32;
 next:=ekr[i1+e2,j1+e1];
 if (next=15) then
  if (b>=127)and(b<=133) then begin ww:=true;stage:=stage+1;end;
end;
procedure provracgran1;
var
 flag1:boolean;
begin
 flag1:=false;
 i1:=(racy div 32)+1;
 j1:=racx div 72;
 next:=ekr[i1+e2,j1+e1];
 case next of
  5,21,1,6:flag1:=true;
  31,17,11,19:if racx<j1*72+45 then flag1:=true;
 end;
  if flag1 then begin
   vzr1(racx-30,racy,vzr,mskvzr,true,1);
   setfillstyle(1,9);
   setactivepage(1-page);
   bar(racx-10,racoy[page]-5,racx+20,racoy[page]+31);
    setactivepage(page);
   bar(racx-10,racoy[page]-5,racx+20,racoy[page]+31);
   rac1:=false;end;
end;
procedure provracgran;
var
 flag1,flag2:boolean;
begin
 flag1:=false;flag2:=false;
 if drac>0 then j1:=(racx div 72)+1 else j1:=racx div 72;
 i1:=racy div 32;
 next:=ekr[i1+e2,j1+e1];
 case next of
  16:flag1:=true;
  15:if racx>j1*72-39 then flag2:=true;
  17,19,14,11,31,28:if racx<j1*72+52 then flag1:=true;
  13,12,29,30,18,20:if racx>j1*72-13 then flag2:=true;
 end;
if flag1 then begin
   vzr1(racx-20,racy-12,vzr,mskvzr,true,1);
   setfillstyle(1,9);
   setactivepage(1-page);
   bar(racx,racy-10,racx+50,racy+21);
   setactivepage(page);
   bar(racx,racy-10,racx+50,racy+21);
   rac:=false;end;
if flag2 then begin
   vzr1(racx-25,racy-12,vzr,mskvzr,true,1);
   setfillstyle(1,9);
   setactivepage(1-page);
   bar(racx-17,racy-10,racx+29,racy+21);
    setactivepage(page);
   bar(racx-17,racy-10,racx+29,racy+21);
   rac:=false;end;
end;
begin
  assign(f,'submar.dat');
  reset(f,1);
  for i:=-2 to 7 do
  begin
   blockread(f,x2,2);
   blockread(f,y2,2);
   blockread(f,size,2);
   getmem(sub[i],size);
   blockread(f,sub[i]^,size);
  end;
  for i:=1 to 10 do
  begin
   blockread(f,x2,2);
   blockread(f,y2,2);
   blockread(f,size,2);
   getmem(vzr[i],size);
   blockread(f,vzr[i]^,size);
  end;
  for i:=1 to 10 do
  begin
   blockread(f,x2,2);
   blockread(f,y2,2);
   blockread(f,size,2);
   getmem(mskvzr[i],size);
   blockread(f,mskvzr[i]^,size);
  end;
  for j:=34 to 36 do
   for i:=1 to 8 do
   begin
    blockread(f,x2,2);
    blockread(f,y2,2);
    blockread(f,size,2);
    getmem(pic[i,j],size);
    blockread(f,pic[i,j]^,size);
   end;
  for i:=-5 to max do
  begin
   blockread(f,x2,2);
   blockread(f,y2,2);
   blockread(f,size,2);
   getmem(kar[i],size);
   blockread(f,kar[i]^,size);
  end;
   blockread(f,x2,2);
   blockread(f,y2,2);
   blockread(f,size,2);
   getmem(bom[1],size);
   blockread(f,bom[1]^,size);
   getmem(bom[0],size);
   bom[0]:=kar[4];
  for i:=0 to 1 do
   for j:=-1 to 1 do
    begin
     blockread(f,x2,2);
     blockread(f,y2,2);
     blockread(f,size,2);
     getmem(torp[i,j],size);
     blockread(f,torp[i,j]^,size);
    end;
  close(f);
  gd:=vga;
  gm:=vgamed;
  initgraph(gd,gm,'');
 for i:=1 to 3 do
  for j:=0 to 1 do
   getmem(massv[i].opic[j],3000);
repeat
 colak:=0;colfi:=0;colos:=0;score:=0;
 stage:=1;gha:=false;
 setfillstyle(1,8);
 assign(fil,'zast.txt');
 reset(fil);
  for i:=0 to 3 do begin
   for j:=0 to 7 do
    read(fil,zas[i,j]);
   readln(fil);
  end;
 close(fil);
for qq:=0 to 1 do
begin
setactivepage(page);
 bar(0,0,640,350);
for i:=0 to 3 do
  for j:=0 to 7 do
   putimage(30+j*72,210+i*32,kar[zas[i,j]]^,normalput);
settextstyle(4,0,4);
a:=40;x[page]:=a;b:=250;tt:=0;ss:='ëìÅåÄêàçÄ';ddy:=0;
{outtextxy(181,11,'ëìÅåÄêàçÄ');
setcolor(green);
outtextxy(180,10,'ëìÅåÄêàçÄ');
setcolor(0); }
setcolor(0);
outtextxy(21,51,'S-ëíÄêí');
outtextxy(21,91,'Q-ÇõïéÑ');
outtextxy(21,131,'N-Çõäã.åìáõäì');
setcolor(red);
outtextxy(20,50,'S-ëíÄêí');
outtextxy(20,90,'Q-ÇõïéÑ');
outtextxy(20,130,'N-Çõäã.åìáõäì');
 setcolor(15);
 rectangle(29,209,606,338);
 rectangle(250+sssr,67,575-bb+sssr,165);
 setcolor(7);
 rectangle(28,208,607,339);
 rectangle(249+sssr,66,576-bb+sssr,166);
 setcolor(6);
 rectangle(248+sssr,65,577-bb+sssr ,167);
 rectangle(27,207,608,340);
 setcolor(yellow);
 settextstyle(0,0,1);
 outtextxy(300+sssr,75,'ìèêÄÇãÖçàÖ');
 outtextxy(255+sssr,90,'ëíêÖãäà-ÑÇàÜÖçàÖ ãéÑäà');
 outtextxy(255+sssr,105,'"+"-ìÇÖãàóÖçàÖ ëäéêéëíà');
 outtextxy(255+sssr,120,'"-"-ìåÖçúòÖçàÖ ëäéêéëíà');
 outtextxy(255+sssr,135,'"Z","X"-áÄèìëä íéêèÖÑ');
 outtextxy(255+sssr,150,'"Q"-ÇõïéÑ');
 outtextxy(50,200,'ÄÇíéêõ: ä„ß≠•ÊÆ¢ ë•‡£•©, Ä‡Â®ØÆ¢ è†¢•´, á†©Ê•¢ Ä´•™·•©.');
 settextstyle(8,2,4);
  setcolor(red);
 outtextxy(469+sssr-20,69,'ñÑûí');
  setcolor(yellow);
 outtextxy(471+sssr-20,71,'ñÑûí');
 setcolor(blue);
 outtextxy(470+sssr-20,70,'ñÑûí');
setvisualpage(page);page:=1-page;
end;
sp:=5;saq:=1;
 mus:=1;pause:=1;
{ getintvec($1C,Old1C);
 setintvec($1C,@Music1);}
settextstyle(4,0,4);
repeat
delay(50);
setvisualpage(page);
page:=1-page;
setactivepage(page);
setfillstyle(1,9);
bar(x[page],b,x[page]+72,b+27);
setfillstyle(1,8);
bar(180,10,430,60);
putimage(a,b,sub[7]^,andput);
putimage(a,b,sub[2]^,xorput);
x[page]:=a;
 ddy:=ddy+saq;
 for kk:=1 to 9 do
 begin
  if odd(kk) then yy:=11+ddy
  else yy:=11-ddy;
  setcolor(0);
  outtextxy(181+(kk-1)*26,yy,ss[kk]);
  setcolor(green);
  outtextxy(180+(kk-1)*26,yy-1,ss[kk]);
 end;
if ddy>4 then saq:=-1;if ddy<-4 then saq:=1;
if a>=605-78 then a:=40;
if sp>9 then sp:=9;
if sp<1 then sp:=0;
a:=a+sp;
if keypressed then begin
  c:=readkey;
  case c of
   'q':begin {setintvec($1C,old1c);nosound;}closegraph;halt;end;
   'n':begin
       { setintvec($1C,old1c);
        nosound;}
       end;
   '+':sp:=sp+1;
   '-':sp:=sp-1;
  end;
end;
until c='s';
{setintvec($1C,old1c);
 nosound;}
settextstyle(0,0,6);
 assign(fil,'ekran1.txt');
  reset(fil);
 loadfon;
 assign(f,'peiza.spr');
   reset(f,1);
   blockread(f,x,2);
   blockread(f,y,2);
   blockread(f,size,2);
   getmem(z,size);
   blockread(f,z^,size);
   setactivepage(0);
   putimage(494,0,z^,normalput);
   setactivepage(1);
   putimage(494,0,z^,normalput);
   freemem(z,size);
   close(f);
 repeat
  for i:=0 to 39 do
  begin
   for j:=0 to 34 do
    read(fil,ekr[i,j]);
    readln(fil);
  end;
  setactivepage(0);
  e1:=0;e2:=0;ww:=false;
  bomb1:=false;kolo2:=301;page:=0;
  interfon;
  str(stage,viv);
  setfillstyle(1,8);
  bar(496+nn,100+mm,640,110+mm);
  outtextxy(496+nn,100+mm,'ìêéÇÖçú-'+viv);
  setactivepage(1);
  interfon;
  str(stage,viv);
  setfillstyle(1,8);
  bar(496+nn,100+mm,640,110+mm);
  outtextxy(496+nn,100+mm,'ìêéÇÖçú-'+viv);
  setactivepage(0);
  setfillstyle(1,9);
  setcolor(red);
  str(stage,viv);
  settextstyle(4,0,6);
  for i:=0 to 1 do begin
  setactivepage(i);
  bar(0,0,503,319);
  outtextxy(100,100,'ìêéÇÖçú '+viv);
  end;
  delay(1000);
  settextstyle(0,0,1);
  a:=72;
  b:=130;
  j1:=1;
  i1:=4;
  x[1]:=a;y[1]:=b;x[0]:=a;y[0]:=b;
  setbkcolor(0);
  setfillstyle(1,9);
  sp:=0;s:=2;k:=2;coltor:=5;col:=1;u:=0;ds:=0;dx:=1;rac:=false;rac1:=false;
  setvisualpage(1-page);setactivepage(page);vivod(kar,ekr,massv,col,e1,e2);col:=1;
  setvisualpage(page);setactivepage(1-page);vivod(kar,ekr,massv,col,e1,e2);
  for i:=1 to col-1 do
   for j:=0 to 1 do begin
   massv[i].num:=1;
   massv[i].dx:=0;massv[i].dy:=0;
  end;
 size:=Imagesize(1,1,73,33);
 if stage>1 then begin
 freemem(opis[0],size);
 freemem(opis[1],size);
 end;
 getmem(opis[0],size);
 getmem(opis[1],size);
  getimage(a,b,a+72,b+32,opis[0]^);getimage(a,b,a+72,b+32,opis[1]^);
  key:=true;setcolor(2);ko2:=4;
  for j:=0 to 1 do begin
   fl[j]:=false;
   setactivepage(j);
   for i:=10 to 310 do
    line(i,330,i,340);
  end;
  repeat
    ko2:=ko2-1;   delay(20);
   if ko2=0 then begin kolo2:=kolo2-1;ko2:=15;fl[0]:=true;fl[1]:=true;end;
   if kolo2 mod 3=0 then begin
                           setfillstyle(1,8);
                           outtextxy(310+nn,332,'äàëãéêéÑ-100%');
                        str(kolo2 div 3,viv);
                        bar(310+nn,332,640,342);
                        outtextxy(310+nn,332,'äàëãéêéÑ-'+viv+'%');
                        setactivepage(1-page);
                        bar(310+nn,332,640,342);
                        outtextxy(310+nn,332,'äàëãéêéÑ-'+viv+'%');
                        setactivepage(1-page);
                         end;
   if fl[page] then begin
    setfillstyle(1,8);fl[page]:=false;
    bar(kolo2+10,330,kolo2+13,340);
    setcolor(2);end;
    setvisualpage(page);
   page:=1-page;u:=1-u;
    setactivepage(page);
    if bomb1 then putimage(boj,boi,bom[page]^,normalput);
    for i:=1 to col-1 do
     putimage(massv[i].x[page],massv[i].y[page],massv[i].opic[page]^,normalput);
    putimage(x[page],y[page],opis[page]^,normalput);

    if rac then begin
     setfillstyle(1,9);
     bar(racox[page],racy,racox[page]+30,racy+9);end;
    if rac1 then begin
     setfillstyle(1,9);
     bar(racx,racoy[page],racx+9,racoy[page]+22);end;
     if kamni then begin
     setfillstyle(1,9);
     for i:=0 to colkam do
      bar(kamx,kamy[page,i],kamx+72,kamy[page,i]+30);
     if kamy[page,colkam]>283 then
     begin
      setfillstyle(1,9);
      setactivepage(1-page);
      bar(kamx,kamy[page,colkam],kamx+72,kamy[page,colkam]+30);
      setactivepage(page);
      colkam:=colkam-1;
     end;
     for i:=0 to colkam do
      kamy[page,i]:=kamy[page,i]+5;
     if kamy[page,0]>96 then
     begin
      colkam:=colkam+1;
      for i:=colkam downto 1 do
       for j:=0 to 1 do
        kamy[j,i]:=kamy[j,i-1];
      kamy[0,0]:=0;kamy[1,0]:=0;
     end;
     end;
    for i:=1 to col-1 do
     getimage(massv[i].ox[page],massv[i].oy[page],massv[i].ox[page]+72,massv[i].oy[page]+64,massv[i].opic[page]^);
    getimage(a,b,a+72,b+32,opis[page]^);
    for i:=1 to col-1 do begin
    putimage(massv[i].ox[page],massv[i].oy[page],pic[u+massv[i].num+4,massv[i].tip]^,andput);
    putimage(massv[i].ox[page],massv[i].oy[page],pic[u+massv[i].num,massv[i].tip]^,xorput);
    massv[i].x[page]:=massv[i].ox[page];
    massv[i].y[page]:=massv[i].oy[page];
    end;
    if kamni then
     for i:=0 to colkam do
      putimage(kamx,kamy[page,i],kar[3]^,normalput);
    if rac then begin
     putimage(racx,racy,torp[1,drac]^,andput);
     putimage(racx,racy,torp[0,drac]^,xorput);end;
    if rac1 then begin
     putimage(racx,racy,torp[1,0]^,andput);
     putimage(racx,racy,torp[0,0]^,xorput);end;
    putimage(a,b,sub[s+5]^,andput);
    putimage(a,b,sub[s]^,xorput);
    if bomb1 then
     if (abs(a+36-boj-16)<50)and(abs(b+16-boi-16)<25) then vzr1(a,b,vzr,mskvzr,true,0);
    x[page]:=a;y[page]:=b;racox[page]:=racx;racoy[page]:=racy;
    for i:=1 to col-1 do provvz;
    if rac or rac1 then provvzrac(rac,rac1);
    if keypressed then begin
      c:=readkey;if c=#0 then c:=readkey;
      dxx:=dx;dyy:=dy;
      dy:=0;
      case c of
      #27:begin closegraph;halt;end;
      'q':vzr1(a,b,vzr,mskvzr,true,0);
      's':begin
            stage:=stage+1;ww:=true;
          end;
      #72:dy:=-3;
      #80:dy:=3;
      #77: begin
             if (dxx=-1)
             then begin
                   ds:=1;
                   zader:=5;
                  end
            else dx:=1;
           end;
      #75: begin
           if (dxx=1)
           then begin
                 ds:=-1;
                 zader:=5;
                end
            else dx:=-1;
           end;
      '-':if sp>0 then begin
                         setfillstyle(1,8);
                        dec(sp);str(sp,viv);
                        bar(496+nn,150+mm,640,160+mm);
                        outtextxy(496+nn,150+mm,'ëäéêéëíú-'+viv);
                        setactivepage(1-page);
                        bar(496+nn,150+mm,640,160+mm);
                        outtextxy(496+nn,150+mm,'ëäéêéëíú-'+viv);
                        setactivepage(1-page);
                       end;
      '+':if sp<9 then begin
                         setfillstyle(1,8);
                        inc(sp);
                        str(sp,viv);
                        bar(496+nn,150+mm,640,160+mm);
                        outtextxy(496+nn,150+mm,'ëäéêéëíú-'+viv);
                        setactivepage(1-page);
                        bar(496+nn,150+mm,640,160+mm);
                        outtextxy(496+nn,150+mm,'ëäéêéëíú-'+viv);
                        setactivepage(1-page);
                      end;
      'z':if (rac=false)and(rac1=false)and(coltor>0) then begin
           rac:=true;coltor:=coltor-1;
           if dx>0 then racx:=a+70 else racx:=a-30;
           drac:=dx;racy:=b+12;racox[0]:=racx;racox[1]:=racx;
          end;
      'x':if (rac=false)and(rac1=false)and(coltor>0) then begin
           racx:=a+32;
           racy:=b+32;racoy[0]:=racy;racoy[1]:=racy;
           if (ekr[(racy div 32)+1+e2,(racx div 72)+e1]=-1)or(ekr[(racy div 32)+1+e2,(racx div 72)+e1]=0) then begin
           rac1:=true;coltor:=coltor-1;end;
          end;
      end;
    end;
      delay(50);
      if (Zader>0)
      then dec(Zader);
      if (ds<>0)and(Zader=0)
      then begin
            s:=s+ds;
            if (s=-2)or(s=2)
            then begin
                   dx:=ds;
                   ds:=0;
                 end;
            zader:=3;
           end;
      if ((b+dy)>300)or((b+dy)<0)
      then dy:=0;
    for i:=1 to col-1 do begin
    if a<massv[i].ox[page] then begin
     massv[i].dx:=-1;massv[i].num:=1;end
      else begin
       massv[i].dx:=1;massv[i].num:=3;end;
    if b<massv[i].oy[page] then massv[i].dy:=-1 else massv[i].dy:=1;
    end;
    for i:=1 to col-1 do begin
     if massv[i].tip=35 then begin
      massv[i].ox[page]:=massv[i].ox[page]+massv[i].dx*2;
      massv[i].oy[page]:=massv[i].oy[page]+massv[i].dy*2;
     end
     else begin
      massv[i].ox[page]:=massv[i].ox[page]+massv[i].dx;
      massv[i].oy[page]:=massv[i].oy[page]+massv[i].dy;
     end;
    end;
    if key=false then pstage;
    if ww=false then gran;
    if kamni then
    begin
     for i:=0 to colkam do
     if(abs(a-kamx)<72)and(abs(b-kamy[page,i])<27) then vzr1(a,b,vzr,mskvzr,true,0);
    end;
    a:=a+dx*sp;b:=b+dy;
    if rac1 then provracgran1;
    if rac then provracgran;
    if rac then
     racx:=racx+drac*10;
    if rac1 then
     racy:=racy+5;
    if (key)and(a+e1*72<=keyx+34)and(b+e2*32+8>=keyy-27)and(keyekr) then begin
     ekr[keyi,keyj]:=0;key:=false;prov(keyx,keyy,32,25);setactivepage(1-page);
     putimage(555,298+mm,u1^,normalput);setactivepage(page);
     putimage(555,298+mm,u1^,normalput);
    end;
    if (a+e1*72<=o2x+40)and(b+e2*32+8>=o2y-23)and(o2)then begin
     kolasdf:=kolo2;
     if kolasdf>=201 then kolo2:=301
      else kolo2:=kolasdf+100;
     setfillstyle(1,2);
     setactivepage(page);
     bar(kolasdf+10,330,kolo2+10,340);
     setactivepage(1-page);
     bar(kolasdf+10,330,kolo2+10,340);
     setactivepage(page);
     ekr[o2i,o2j]:=0;prov(o2x,o2y,32,32);o2:=false;end;
    if (a+e1*72<=bx+40)and(b+e2*32+8>=by-23)and(box)then begin
     ekr[bi,bj]:=0;prov(bx,by,32,32);box:=false;coltor:=coltor+5;
     end;
    perehod(ekr,a,b,dx,dy,massv,col,e1,e2);
    if rac or rac1 then provrac;
     setfillstyle(1,8);
     setcolor(green);
    str(coltor,viv);
    bar(496+nn,125+mm,640,135+mm);
    outtextxy(496+nn,125+mm, 'íéêèÖÑõ-'+viv);
    setactivepage(1-page);
    bar(496+nn,125+mm,640,135+mm);
    outtextxy(496+nn,125+mm, 'íéêèÖÑõ-'+viv);
    setactivepage(1-page);
  until (kolo2=0)or(ww)or(gha);
 until (not(ww))or(stage=4)or(gha);
if (not(ww))or(gha) then begin
 setfillstyle(1,9);
 setcolor(red);
 settextstyle(7,0,6);
 for i:=0 to 1 do begin
  setactivepage(i);
  bar(0,0,503,319);
  outtextxy(62,100,'ÑéàÉêÄãëü');
 end;
 readkey;
mus:=1;pause:=1;
{ getintvec($1C,Old1C);
 setintvec($1C,@Music);}
 delay(10);  {<<<--®(≠• ¢ Ê®™´•) }
{ setintvec($1C,old1c);
 nosound;}
end;
if stage=4 then begin
 settextstyle(7,0,6);
 setfillstyle(1,9);
 setcolor(red);
  for i:=0 to 1 do begin
  setactivepage(i);
  bar(0,0,503,319);
  outtextxy(100,100,'åéãéÑÖñ');
  end;
{  delay(200);}
  readkey;
end;
until 1=2;
 close(fil);
  closegraph;
end.



