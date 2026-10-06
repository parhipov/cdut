{$A+,B-,D+,E+,F-,G-,I+,L+,N-,O-,P-,Q+,R+,S+,T-,V+,X+,Y+}
{$M 16384,0,655360}
Unit modul;
interface
uses vx,objects,crt,mouse,sbplay;
const
      cmMouse=1;
      cmKey=2;
      cmNothing=3;
      cmEvent=4;
      cmSdvig=5;
      cmRobot=6;
      cmTank=7;
      cmAir=8;
      cmHouse=9;
      cmNoHouse=10;
      cmNoPutBuild=11;{здание не поставлено}
      cmPutBuild=12;{здание поставлено}
      cmVali=13;
      cmWho=14;
      cmWho2=15;
      cmWho3=16;
      cmWho4=17;
      cmDecNumber=18;
      cmItIsWho=19;
      cmInsertToVibor=20;{вставить в список выбраных}
      cmNewGo=21;
      cmAttack=22;
      cmUnSelect=23;
      cmSelect=24;
      cmDecPower=25;
      cmIAmDied=26;
      cmDel=27;
      cmGetXY=28;
      cmKoord=29;
      cmObj=30;
{      cmGo=543;}
      cmFire=31;
      cmGetNum=32;
      cmRadar=33;
      cmGroup=34;
      cmUnGroup=35;
      cmToGroup=36;
      cmUnRepair=37;
      cmIncPower=38;
      cmCloack=39;
      cmIAmCloack=40;
      cmUnAttack=41;
      cmTurret=42;
      cmPutTurret=43;
      cmYouDied=44;
      cmDecTurret=45;
      cmNewDefen=46;
      cmdecDefen=47;
      cmAttack2=48;
      cmNewGo2=49;
      cmPutHouse=50;
      cmUnDefen=51;
      cmUnBuilder=52;
      cmFreeHarv=53;
      cmGetTip=54;
      cmAttack3=55;
      cmGetTip121=56;
      cmSmoke=57;
      cmChrono=58;
      cmAttack4=59;
      cmGetKoord=60;
      cmLoad=61;
      cmLoad2=62;
      cmAllUnLoad=63;
      cmUnLoad2=64;
      cmOneUnLoad=65;
      cmPal=66;
{      cmNumber=67;}
      cmSave=68;
      cmLoadf=69;
      cmNewTank=70;
      cmNewAir=71;
      cmNewHouse=72;
      cmNewRoc=73;
      cmNewRoc2=74;
      cmNewSm=75;
      cmNewRobot=76;
      cmWhoIsit=77;
      cmRestore=78;
      cmNo=79;
      cmYes=80;

      flagTiberium:byte=0;
      flag67:boolean=false;
      zahvat:boolean=false;{нечто, связанное с захватом ресурсов}
      attack:boolean=false;{атака}
      complet:boolean=true;
      patrol:array[0..1] of boolean=(true,true);
      numberbuild:array[120..126] of byte=(0,0,0,0,0,0,0);
      maxbuild:array[120..126] of byte=(0,0,1,1,1,5,0);{(0,0,1,1,1,5,0)}
      masflagbuild:array[121..126] of boolean=(true,false,false,false,true,false);
      masMyflagbuild:array[111..118] of boolean=(true,false,false,false,true,false,false,false);
      koltank:integer=5;
      kolAir:integer=5;
      kolpatrol:array[0..1] of integer=(10,10);
      incKol:array[0..1] of integer=(10,10);
      maxTurret:array[70..71] of byte=(1,1);
      maxDefen:array[0..1] of byte=(1,1);
      Way:array[0..4,0..1] of integer=((85,57),(60,57),(55,70),(55,86),(85,86));
      noTiberium:boolean=false;
      flagNewBuild:boolean=false;
      Construction:boolean=false;
      Money:array[0..1]of longint=(9000,9000);
      flagMenu:boolean=true;
      newMenu:array[0..1] of boolean=(true,true);
      flagQuit:boolean=false;
      failed:boolean=false;
      victory:boolean=false;
      flagplay:integer=10000;
      wait:integer=0;
      Cursor:byte=1;
      oldCursor:byte=0;
      flagCursor:byte=0;
      oldflagCursor:byte=0;
      chronoCur:boolean=false;
      flagChrono:boolean=false;
      maxLoad=8;

      Time=0;     {скроллинг}
      buildTech=11;
      buildHouse=22;
      pouse=30;
      kkkk=20;
      kkktime=20;
      kkktime2=40;
      kkktime3=1;
      size2=66;
      moneycolor=163;
      maxx=89;
      maxy=89;
      radarx=536;
      radary=15;
      mycolor=10;
      enemycolor=12;
      diedcolor=38;
      xxx=2+540;
      yyy=220;
      xxx2=542;
      yyy2=170;
      yyy3=140;
      menux=110;
      menuy=70;
      menux2=520-110;
      menuy2=480-70;
      maxIcon=30;
      time4=2;
      time5=1;
      time6=1;
      timep=1;
      time7=3;
      time8=2;{time to phase smoke}
      time9=4;{chastota smoke (tech)}
      time10=0;{time to sdvig smoke}
      time11=5;{chastota smoke (house)}
      time12=10;{inc cloack and chrono power}
      time13=10;{bombardirovka}
      time14=8;{time show krest}
      flagLoadfile:boolean=false;
      kolSt=15;
      prioritet:integer=60;
      rocetstep:integer=40;
{      dxx:array[1..8]of integer=(-1,1,0,1,-1,1,-1,0);
      dyy:array[1..8]of integer=(-1,1,1,0,1,-1,0,-1);}

type
  rec=array[0..1033]of byte;
  tmasTimeBuild=array[0..130] of integer;
  tmasSize=array[0..130,0..1] of byte;
  tmasCoast=array[0..130] of integer;
  tmasflagIcon=array[0..maxicon] of boolean;
  tmasIcon=array[0..maxicon] of pointer;
  tSmoke=array[0..1,0..5]of pointer;
  tPict=array[0..20]of pointer;
  tPictMove=array[0..2]of pointer;
  tPole=array[0..maxx,0..maxy,0..1] of byte;
  tPole2=array[-1..maxx+1,-1..maxy+1] of byte;
  tMasTank=array[23..90,0..11] of pointer;
  tDirt=array[0..15] of pointer;
  tBullet=array[0..10,0..7] of pointer;
  tHouses=array[110..130,0..11] of pointer;
  tGruppa=array[0..9]of boolean;
  tTarget=record
     case Watch:word of
       cmKoord:(x,y:integer);
       cmObj:(kogo:pointer);
     end;
var
{  t:real;{temp for smoke}
  aa,bb,cc:real;

  filename:string;
  fileStr:string[32];
  numFile:integer;
  savefile,loadfile:file;
  w:word;
  cursors:array[0..10]of rec;
  masSmoke:tSmoke;
  TimeToQuit:integer;
  pole3,pole:tPole;
  pole2:tPole2;
  polex,poley:integer;
  energe,maxenerge:array[0..1]of integer;
  maxnumber,number:array[0..1]of byte;{кол-во построеных роботов}
  shadow:boolean;
  page:byte;
  flaggo2,flaggo,fff:boolean;
  newHelp,help,newMoney,newpanel,pereris:array[0..1] of boolean;
  mastimeBuild:tmasTimeBuild;
  masTime,masDam,masDis,maspow:tMasTimebuild;
  masflagicon:tmasflagIcon;
  masIcon:tmasIcon;
  masSize:tMasSize;
  masCoast:tMasCoast;
  dirt:tDirt;
  pict:tPict;
  pictMove:tPictMove;
  houses:tHouses;
  tank:tMasTank;
  bullet:tBullet;
  key:char;
  build:boolean;
  sostB,sostT,sostA:byte;
  x:integer;
  st:string;
  LittP,GothP:pointer;

function nomer(c:char):byte;
function shift:boolean;
function control:boolean;
function prov(myx,myy,x,y,lenx,leny,flag:integer):boolean;
function ang(x1,y1,x2,y2:integer):byte;
function numIcon(mx,my:word):byte;
function rasst(x1,y1,x2,y2:real):integer;
procedure initpole(var pole4,pole5:tPole);
procedure radar;
procedure radar2;
procedure Button(n,c:integer;svoistvo:boolean);
procedure modifpole(x1,y1,x2,y2:integer);
procedure modifpole2(xx,yy,tip:integer);
procedure newp(n:byte);
procedure initmas;
procedure loadpict;
procedure showpole(f:boolean);
procedure showallpole(f:boolean);
procedure Retrace;
procedure WaitVBL;
procedure play2;
procedure SetCursor(n:byte);

implementation

procedure goth;external;
{$L goth.obj}
procedure litt;external;
{$L litt.obj}

procedure play2;
begin
{expl house}
  if (flagplay=200)
  then begin
    play('expl2.wav');
    wait:=200;
    exit;
  end;
{expl avia}
  if (flagplay=250)and((endingPlay)or(wait>=250))
  then begin
    play('expl3.wav');
    wait:=250;
    exit;
  end;
{expl tank}
  if (flagplay=300)and((endingPlay)or(wait>=300))
  then begin
    play('expl1.wav');
    wait:=300;
    exit;
  end;
{shot turrets}
  if (flagplay=500)and((endingPlay)or(wait>=500))
  then begin
    play('shot1.wav');
    wait:=500;
    exit;
  end;
{shot batllecruser}
  if (flagplay=600)and((endingPlay)or(wait>=600))
  then begin
    play('laser2.wav');
    wait:=600;
    exit;
  end;
{shot valkiria}
  if (flagplay=650)and((endingPlay)or(wait>=650))
  then begin
    play('laser3.wav');
    wait:=650;
    exit;
  end;
{shot air}
  if (flagplay=700)and((endingPlay)or(wait>=700))
  then begin
    play('laser1.wav');
    wait:=700;
    exit;
  end;
{shot chronotank}
  if (flagplay=750)and((endingPlay)or(wait>=750))
  then begin
    play('shot2.wav');
    wait:=750;
    exit;
  end;
{shot tank}
  if (flagplay=800)and((endingPlay)or(wait>=800))
  then begin
    play('shot2.wav');
    wait:=800;
    exit;
  end;

end;

procedure SetCursor(n:byte);
begin
 if n<>0
 then setUserCursor(addr(cursors[n]))
 else resetMouseCursor;
end;

procedure Retrace;
begin
asm
  mov   ax,0h
  mov   es,ax
  mov   dx,es:[463h]
  add   dl,6
  in   al,dx
  test   al,8
  jz   @wait_on
@wait_off:
  in   al,dx
  test   al,8
  jnz   @wait_off
@wait_on:
  in   al,dx
  test   al,8
jz   @wait_on
end;
end;

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

procedure showpole(f:boolean);
var i,j,m1,m2,n1,n2,ii,jj,i1,i2,j1,j2:integer;
begin
  hidemouse;
  if not f
  then begin
    for i:=polex to polex+12 do
      for j:=poley to poley+11 do
      begin
        if (pole2[i,j]=1)
        then begin
          putsprite((i-polex)*40,(j-poley)*40,dirt[0]);
        end;
{        if pole[i,j,0] in [10]
        then putsprite((i-polex)*40,(j-poley)*40,dirt[10]);
        if pole[i,j,0] in [254]
        then putsprite((i-polex-2)*40,(j-poley-1)*40,dirt[10]);}
      end;
  end;
  if polex-1>0 then m1:=polex-1 else m1:=0;
  if poley-1>0 then n1:=poley-1 else n1:=0;
  if polex+13<maxx then m2:=polex+13 else m2:=maxx;
  if poley+12<maxy then n2:=poley+12 else n2:=maxy;
  for i:=m1 to m2 do
    for j:=n1 to n2 do
    begin
{      setcolor(white);
      str(pole2[i,j],st);
      outtextxy((i-polex)*40,(j-poley)*40,st);}
      if (pole2[i,j]=1)
      or((pole3[i,j,0]>=25)and(pole3[i,j,0]<=29))or(pole3[i,j,0]>=30)
      then begin
        if not f
        then begin
          if i-1>0 then i1:=i-1 else i1:=0;
          if j-1>0 then j1:=j-1 else j1:=0;
          if i+1<maxx then i2:=i+1 else i2:=maxx;
          if j+1<maxy then j2:=j+1 else j2:=maxy;
          for ii:=i1 to i2 do
            for jj:=j1 to j2 do
              if pole3[ii,jj,0]in[12]
              then pole2[ii,jj]:=1;
        end;
        if not(pole[i,j,0]in[113..126,200,201,205,206])
        then begin
          pole2[i,j]:=0;
        end;

        if pole[i,j,0] in [10,254,255]
        then begin
          if i-2>0 then i1:=i-1 else i1:=0;
          if j-2>0 then j1:=j-1 else j1:=0;
          if i+2<maxx then i2:=i+1 else i2:=maxx;
          if j+2<maxy then j2:=j+1 else j2:=maxy;
          for ii:=i1 to i2 do
            for jj:=j1 to j2 do
              if pole[ii,jj,0] in [10]
              then putsprite((ii-polex)*40,(jj-poley)*40,dirt[10]);
        end;

        if (pole3[i,j,0]in [233])and(not f)
        then putsprite((i-polex-1)*40,(j-poley)*40,dirt[7]);
        if (pole3[i,j,0]in [1..6,8..9,11..12])
        then begin
          if (not f)and not(pole3[i,j,0]in[1,3,4,9,11])
          then
            pole2[i,j]:=1
          else begin
            if pole3[i,j,0]in[12]
            then putsprite((i-polex)*40-12,(j-poley)*40-33,dirt[12])
            else putsprite((i-polex)*40,(j-poley)*40,dirt[pole3[i,j,0]]);
          end
        end;
      end;
    end;
  showmouse;
end;

procedure showallpole(f:boolean);
var i,j,m1,m2,n1,n2,ii,jj,i1,i2,j1,j2:integer;
begin
  hidemouse;
  if not f
  then
  for i:=polex to polex+12 do
    for j:=poley to poley+11 do
    begin
      putsprite((i-polex)*40,(j-poley)*40,dirt[0]);
      if pole[i,j,0] in [10] then putsprite((i-polex)*40,(j-poley)*40,dirt[10]);
      if pole[i,j,0] in [254] then putsprite((i-polex-2)*40,(j-poley-1)*40,dirt[10]);
    end;
  if polex-1>0 then m1:=polex-1 else m1:=0;
  if poley-1>0 then n1:=poley-1 else n1:=0;
  if polex+13<maxx then m2:=polex+13 else m2:=maxx;
  if poley+12<maxy then n2:=poley+12 else n2:=maxy;
  for i:=m1 to m2 do
    for j:=n1 to n2 do
    begin
      if (pole3[i,j,0]in [233])
      then
       putsprite((i-polex-1)*40,(j-poley)*40,dirt[7]);

      if pole[i,j,0] in [10,254,255]
      then begin
        if i-2>0 then i1:=i-1 else i1:=0;
        if j-2>0 then j1:=j-1 else j1:=0;
        if i+2<maxx then i2:=i+1 else i2:=maxx;
        if j+2<maxy then j2:=j+1 else j2:=maxy;
        for ii:=i1 to i2 do
          for jj:=j1 to j2 do
            if pole[ii,jj,0] in [10]
            then putsprite((ii-polex)*40,(jj-poley)*40,dirt[10]);
      end;

      if (pole3[i,j,0]in [1..6,8..9,11..12])and(f)
      then begin
        if pole3[i,j,0]in[12]
        then putsprite((i-polex)*40-12,(j-poley)*40-33,dirt[12])
        else putsprite((i-polex)*40,(j-poley)*40,dirt[pole3[i,j,0]]);
      end;
    end;
  showmouse;
end;

function nomer(c:char):byte;
begin
  nomer:=255;
  case c of
    '!','1':nomer:=1;
    '@','2':nomer:=2;
    '#','3':nomer:=3;
    '$','4':nomer:=4;
    '%','5':nomer:=5;
    '^','6':nomer:=6;
    '&','7':nomer:=7;
    '*','8':nomer:=8;
    '(','9':nomer:=9;
    ')','0':nomer:=0;
  end;
end;

function shift:boolean;
var b:byte;
begin
asm
  mov ah,02h
  int 16h
  and al,011b
  mov b,al
end;
  shift:=(b<>0)
end;

function control:boolean;
var b:byte;
begin
asm
  mov ah,02h
  int 16h
  and al,04h
  mov b,al
end;
  control:=(b<>0)
end;

function prov(myx,myy,x,y,lenx,leny,flag:integer):boolean;
var i,j:integer;
begin
  prov:=false;
  if flag=0
  then begin
    for i:=x-1 to x+lenx do
      for j:=y-1 to y+leny do
        if (myx=i)and(myy=j)then
          prov:=true;
  end;
  if flag=1
  then begin
    for i:=x to x+lenx-1 do
      for j:=y+leny+1 to y+leny+1 do
        if (myx=i)and(myy=j)then
          prov:=true;
  end;
end;

procedure initpole(var pole4,pole5:tPole);
var i,j,n:integer;
begin
{  randomize;}
  for i:=0 to maxx do
    for j:=0 to maxy do
    begin
      n:=random(2000);{1,9,11-над}
      if (n>=0)and(n<30)then pole4[i,j,0]:=1;
      if (n>29)and(n<70)then pole4[i,j,0]:=2;
      if (n>69)and(n<120)then pole4[i,j,0]:=3;{}
      if (n>119)and(n<160)then pole4[i,j,0]:=4;{}
      if (n>159)and(n<180)then pole4[i,j,0]:=5;
      if (n>179)and(n<200)then pole4[i,j,0]:=6;
      if ((n>199)and(n<205))and(i<maxx)
      then begin
        pole4[i,j,0]:=7;
        pole4[i+1,j,0]:=233;
        inc(i);
      end;
{      dirt[11]:=tank[30,1];}
      if (n>204)and(n<210)then pole4[i,j,0]:=8;
      if (n>209)and(n<219)then pole4[i,j,0]:=9;
      if (n>218)and(n<229)then pole4[i,j,0]:=11;
      if (n>222)and(n<255)then pole4[i,j,0]:=12;
      if n>254 then pole4[i,j,0]:=0;
    end;
  for i:=30 to 32 do
    for j:=30 to 31 do
      pole4[i,j,0]:=255;
  pole4[30,30,0]:=10;
  pole4[32,31,0]:=254;

  for i:=76 to 78 do
    for j:=76 to 77 do
      pole4[i,j,0]:=255;
  pole4[76,76,0]:=10;
  pole4[78,77,0]:=254;

  for i:=20 to 22 do
    for j:=70 to 71 do
      pole4[i,j,0]:=255;
  pole4[20,70,0]:=10;
  pole4[22,71,0]:=254;

  for i:=70 to 72 do
    for j:=30 to 31 do
      pole4[i,j,0]:=255;
  pole4[70,30,0]:=10;
  pole4[72,31,0]:=254;

{  pole4[72,35,0]:=5;}

  for i:=9 to 11 do
    for j:=7 to 8 do
      pole4[i,j,0]:=255;
  pole4[9,7,0]:=10;
  pole4[11,8,0]:=254;

  pole5:=pole4;
end;

procedure radar2;
begin
  rectangle(radarx-2,radary-2,radarx+maxx+2,radary+maxy+2,29,29);
  setcolor(yellow);
  line(radarx+polex,radary-2,radarx+polex+12,radary-2);
  line(radarx-2,radary+poley,radarx-2,radary+poley+11);
  line(radarx+polex,radary+maxy+2,radarx+polex+12,radary+maxy+2);
  line(radarx+maxx+2,radary+poley,radarx+maxx+2,radary+poley+11);
end;

procedure radar;
var i,j:integer;
begin
  for i:=0 to maxx do
    for j:=0 to maxy do
      case pole[i,j,0] of
        2,5,6,12:putpixel(radarx+i,radary+j,103);
        11,8,9,1,7,233:putpixel(radarx+i,radary+j,59);
        10:begin
            setcolor(moneycolor);
            bar(radarx+i,radary+j,radarx+i+2,radary+j+1)
          end;
      end;
end;

procedure Button(n,c:integer;svoistvo:boolean);
var colup,coldown:byte;
    x1,y1,x2,y2:integer;
begin
{  setwsize(0,0,640,480);}
  x1:=0;y1:=0;x2:=0;y2:=0;
  case n of
    0:begin
        x1:=xxx2;y1:=yyy2;
        x2:=xxx2+42+35;y2:=yyy2+40;
      end;
    1:begin
        x1:=xxx;y1:=yyy;
        x2:=xxx+35;y2:=yyy+35;
      end;
    2:begin
        x1:=xxx+42;y1:=yyy;
        x2:=xxx+42+35;y2:=yyy+35;
      end;
    3:begin
        x1:=xxx;y1:=yyy+42;
        x2:=xxx+35;y2:=yyy+42+35;
      end;
    4:begin
        x1:=xxx+42;y1:=yyy+42;
        x2:=xxx+42+35;y2:=yyy+42+35;
      end;
    5:begin
        x1:=xxx;y1:=yyy+42*2;
        x2:=xxx+35;y2:=yyy+42*2+35;
      end;
    6:begin
        x1:=xxx+42;y1:=yyy+42*2;
        x2:=xxx+42+35;y2:=yyy+42*2+35;
      end;
    7:begin
        x1:=xxx;y1:=yyy+42*3;
        x2:=xxx+35;y2:=yyy+42*3+35;
      end;
    8:begin
        x1:=xxx+42;y1:=yyy+42*3;
        x2:=xxx+42+35;y2:=yyy+42*3+35;
      end;
    25:begin
         x1:=xxx-7;y1:=yyy3;
         x2:=xxx+20-7;y2:=yyy3+20;
       end;
    26:begin
         x1:=xxx+20-3;y1:=yyy3;
         x2:=xxx+60;y2:=yyy3+20;
       end;
    27:begin
         x1:=xxx+60+4;y1:=yyy3;
         x2:=xxx+60+20+4;y2:=yyy3+20;
       end;
    98:begin
         x1:=xxx-3;y1:=yyy+42*5+7;
         x2:=xxx+21;y2:=yyy+42*5+20+11;
       end;
    99:begin
         x1:=xxx+27;y1:=yyy+42*5+7;
         x2:=xxx+27+24;y2:=yyy+42*5+20+11;
       end;
    100:begin
          x1:=xxx+57;y1:=yyy+42*5+7;
          x2:=xxx+57+24;y2:=yyy+42*5+20+11;
        end;
  end;

  SetColor(c);
  SetWriteMode(NormalPut);
  bar(x1,y1,x2,y2);
  case svoistvo of
    true: begin
            ColUp:=35;
            ColDown:=22;
          end;
    false: begin
             ColUp:=22;
             ColDown:=35;
           end;
  end;
  rectangle(x1,y1,x2,y2,Colup,ColDown);
  rectangle(x1-1,y1-1,x2+1,y2+1,39,39);
  if n=25
  then begin
    hidemouse;
    putsprite(xxx-5,yyy3+1,pict[0]);
    showmouse;
  end;
  if n in[98..100]
  then begin
    hidemouse;
    if n=98 then putsprite(x1+2,y1+2,pict[9]);
    if n=99 then putsprite(x1+1,y1+1,pict[10]);
    if n=100 then putsprite(x1+2,y1+2,pict[11]);
    showmouse;
  end;
{  setwsize(0,0,520,480);}
end;

function ang(x1,y1,x2,y2:integer):byte;
begin
  ang:=2;
  if (x1<x2) then ang:=0;
  if (x1>x2) then ang:=4;
  if (y1>y2) then ang:=2;
  if (y1<y2) then ang:=6;
  if (x1<x2)and(y1<y2) then ang:=7;
  if (x1>x2)and(y1>y2) then ang:=3;
  if (x1<x2)and(y1>y2) then ang:=1;
  if (x1>x2)and(y1<y2) then ang:=5;
end;

function numIcon(mx,my:word):byte;
begin
  numIcon:=0;
  if (mx>xxx)and(mx<xxx+35)and(my>yyy)and(my<yyy+35)
    then numIcon:=1;
  if (mx>xxx+42)and(mx<xxx+42+35)and(my>yyy)and(my<yyy+35)
    then numIcon:=2;
  if (mx>xxx)and(mx<xxx+35)and(my>yyy+42)and(my<yyy+42+35)
    then numIcon:=3;
  if (mx>xxx+42)and(mx<xxx+42+35)and(my>yyy+42)and(my<yyy+42+35)
    then numIcon:=4;
  if (mx>xxx)and(mx<xxx+35)and(my>yyy+42*2)and(my<yyy+42*2+35)
    then numIcon:=5;
  if (mx>xxx+42)and(mx<xxx+42+35)and(my>yyy+42*2)and(my<yyy+42*2+35)
    then numIcon:=6;
  if (mx>xxx)and(mx<xxx+35)and(my>yyy+42*3)and(my<yyy+42*3+35)
    then numIcon:=7;
  if (mx>xxx+42)and(mx<xxx+42+35)and(my>yyy+42*3)and(my<yyy+42*3+35)
    then numIcon:=8;
  if(mx>xxx-7)and(mx<xxx+20-7)and(my>yyy3)and(my<yyy3+20)
    then numIcon:=25;
  if (mx>xxx-3)and(mx<xxx+21)and(my>yyy+42*5+7)and(my<yyy+42*5+20+11)
    then numIcon:=98;
  if (mx>xxx+27)and(mx<xxx+27+24)and(my>yyy+42*5+7)and(my<yyy+42*5+20+11)
    then numIcon:=99;
  if (mx>xxx+57)and(mx<xxx+57+24)and(my>yyy+42*5+7)and(my<yyy+42*5+20+11)
    then numIcon:=100;
end;

procedure modifpole(x1,y1,x2,y2:integer);
var i,j,i1,i2,j1,j2:integer;
begin
  if x1>x2 then begin
    i:=x1;x1:=x2;x2:=i;
  end;
  if y1>y2 then begin
    i:=y1;y1:=y2;y2:=i;
  end;
  i1:=(x1 div 40)+polex;
  j1:=(y1 div 40)+poley;
  i2:=(x2 div 40)+polex;
  j2:=(y2 div 40)+poley;
{  for i:=i1 to i2 do
    pole2[i,j1]:=1;
  for i:=j1 to j2 do
    pole2[i1,i]:=1;
  for i:=i1 to i2 do
    pole2[i,j2]:=1;
  for i:=j1 to j2 do
    pole2[i2,i]:=1;}
  for i:=i1-1 to i2+1 do
    for j:=j1-1 to j2+1 do
      if (i>=0)and(j>=0)and(i<=maxx)and(j<=maxy) then pole2[i,j]:=1;
end;

procedure modifpole2(xx,yy,tip:integer);
begin
  if (tip>=30)and(yy-1>0)then begin
    pole2[xx,yy-2]:=1;pole2[xx+1,yy-2]:=1;pole2[xx-1,yy-2]:=1;
  end;
  if ((tip=31)or(tip=46)or(tip=77))and(yy-3>=0) then begin
    pole2[xx,yy-3]:=1;pole2[xx+1,yy-3]:=1;pole2[xx-1,yy-3]:=1;
  end;
{  if (tip=31)and(xx-2>=0) then begin
    pole2[xx-2,yy]:=1;pole2[xx-1,yy-1]:=1;pole2[xx-2,yy-1]:=1;
  end;}

  pole2[xx,yy]:=1;
  pole2[xx+1,yy]:=1;
  pole2[xx-1,yy]:=1;
  pole2[xx,yy+1]:=1;
  pole2[xx,yy-1]:=1;
  pole2[xx+1,yy+1]:=1;
  pole2[xx-1,yy-1]:=1;
  pole2[xx+1,yy-1]:=1;
  pole2[xx-1,yy+1]:=1;
end;

procedure newp(n:byte);
var i,j:integer;
begin
  for i:=0 to maxx do
    for j:=0 to maxy do
      pole2[i,j]:=n;
end;

function rasst(x1,y1,x2,y2:real):integer;
var i:integer;
begin
  i:=integer(round(sqrt(sqr(x1-x2)+sqr(y1-y2))));
  if i=0 then i:=1;
  rasst:=i;
{  if i>1000 then halt;}
end;

procedure loadcursors;
var f:file;
begin
  assign(f,'c_menu.spr');
  reset(f,1);
  BlockRead(f,Cursors[1],6,w);
  blockread(f,cursors[1],sizeof(cursors[1]),w);
  close(f);
  cursors[1][0]:=0;
  cursors[1][1]:=0;
  Cursors[1][2]:=5;
  Cursors[1][3]:=5;

  assign(f,'c_repair.spr');
  reset(f,1);
  BlockRead(f,Cursors[2],6,w);
  blockread(f,cursors[2],sizeof(cursors[2]),w);
  close(f);
  cursors[2][0]:=0;
  cursors[2][1]:=0;
  Cursors[2][2]:=2;
  Cursors[2][3]:=3;

  assign(f,'c_Go.spr');
  reset(f,1);
  BlockRead(f,Cursors[3],6,w);
  blockread(f,cursors[3],sizeof(cursors[3]),w);
  close(f);
  cursors[3][0]:=0;
  cursors[3][1]:=0;
  Cursors[3][2]:=14;
  Cursors[3][3]:=15;

  assign(f,'c_fire.spr');
  reset(f,1);
  BlockRead(f,Cursors[4],6,w);
  blockread(f,cursors[4],sizeof(cursors[4]),w);
  close(f);
  cursors[4][0]:=0;
  cursors[4][1]:=0;
  Cursors[4][2]:=14;
  Cursors[4][3]:=15;

  assign(f,'c_chrono.spr');
  reset(f,1);
  BlockRead(f,Cursors[5],6,w);
  blockread(f,cursors[5],sizeof(cursors[5]),w);
  close(f);
  cursors[5][0]:=0;
  cursors[5][1]:=0;
  Cursors[5][2]:=14;
  Cursors[5][3]:=15;
end;

procedure initmas;
begin
  build:=false;
  for x:=0 to maxicon do
    masflagicon[x]:=false;

  for x:=10 to 130 do
  begin
    maspow[x]:=200;
    masdam[x]:=20;
    masdis[x]:=240;
    masTime[x]:=30;
  end;
  maspow[31]:=500;
  masdam[31]:=120;
  masdis[31]:=320;
  masTime[31]:=30;
  maspow[77]:=500;
  masdam[77]:=120;
  masdis[77]:=320;
  masTime[77]:=30;

  masdam[30]:=5;
  masdis[30]:=200;
  masTime[30]:=10;
  masdam[76]:=5;
  masdis[76]:=200;
  masTime[76]:=10;

  maspow[32]:=250;
  masdam[32]:=10;
  masTime[32]:=10;
  maspow[78]:=250;
  masdam[78]:=10;
  masTime[78]:=10;

  maspow[33]:=300;
  masdam[33]:=30;
  masdis[33]:=280;
  masTime[33]:=15;
  maspow[79]:=300;
  masdam[79]:=20;
  masdis[79]:=280;
  masTime[79]:=15;

  masDis[34]:=240+120;
  masDis[80]:=240+120;

  maspow[35]:=400;

{  maspow[28]:=300;
  masdam[28]:=20;
  masdis[28]:=280;
  masTime[28]:=15;}

  maspow[29]:=400;
  masdam[29]:=120;
  masdis[29]:=240+40;
  masTime[29]:=40;

  maspow[23]:=300;
  masdam[23]:=80;
  masdis[23]:=240+120;
  masTime[23]:=40;

  maspow[27]:=150;
  masdam[27]:=20;
  masdis[27]:=240+40;
  masTime[27]:=20;

  maspow[61]:=400;
  masdam[61]:=120;
  masdis[61]:=240+120;
  masTime[61]:=40;

  maspow[40]:=400;
  masdam[40]:=20;
  masTime[40]:=20;

  maspow[41]:=400;
  masdam[41]:=20;
  masTime[41]:=20;

  for x:=10 to 130 do
    masTimeBuild[x]:=150;
  masTimebuild[23]:=10;
  masTimebuild[26]:=10;
  masTimebuild[27]:=10;
  masTimebuild[28]:=10;
  masTimebuild[29]:=10;
  masTimebuild[30]:=10;
  masTimebuild[31]:=10;
  masTimebuild[32]:=200;
  masTimebuild[33]:=30;
  masTimebuild[34]:=100;
  masTimebuild[35]:=10;
  masTimebuild[36]:=5;

  for x:=10 to 130 do
    masCoast[x]:=10;

  for x:=0 to 130 do
  begin
    massize[x,0]:=3;
    massize[x,1]:=3;
  end;
  massize[121,1]:=4;
  massize[122,1]:=2;
  massize[125,1]:=2;
  massize[126,0]:=2;
  massize[112,0]:=4;
  massize[112,1]:=2;
  massize[113,0]:=3;
  massize[113,1]:=2;
  massize[123,1]:=2;
  massize[116,0]:=3;
  massize[116,1]:=2;
  massize[40,0]:=1;
  massize[40,1]:=1;
  massize[41,0]:=1;
  massize[41,1]:=1;
  massize[42,0]:=1;
  massize[42,1]:=1;

  maxenerge[0]:=0;
  maxenerge[1]:=0;
  energe[0]:=0;
  energe[1]:=0;
  maxnumber[0]:=0;
  maxnumber[1]:=0;

end;

procedure loadpict;
var f:file;
    i,j:integer;
begin
  assign(f,'dirt.dat');   {10- spice}
  reset(f,1);
  for i:=0 to 11 do
    dirt[i]:=loadspr1(f);
  close(f);
  dirt[12]:=loadspr('tree.spr');

  assign(f,'mytank.dat'); {загрузка танков (всех) }
  reset(f,1);
  for i:=23 to 27 do
    for j:=0 to 7 do
      tank[i,j]:=loadspr1(f);
  close(f);

  assign(f,'mytank2.dat');
  reset(f,1);
  for i:=28 to 29 do
    for j:=0 to 7 do
      tank[i,j]:=loadspr1(f);
  close(f);

  assign(f,'mytank5.dat');
  reset(f,1);
  for i:=23 to 23 do
    for j:=0 to 7 do
      tank[i,j]:=loadspr1(f);
  close(f);

  assign(f,'mytank3.dat');
  reset(f,1);
  for i:=26 to 26 do
    for j:=0 to 7 do
      tank[i,j]:=loadspr1(f);
  close(f);

  assign(f,'enemtank.dat');
  reset(f,1);
  for i:=60 to 63 do
    for j:=0 to 7 do
      tank[i,j]:=loadspr1(f);
  close(f);

  assign(f,'entank.dat');
  reset(f,1);
  for i:=67 to 67 do
    for j:=0 to 7 do
      tank[i,j]:=loadspr1(f);
  close(f);

  assign(f,'myharv.dat');
  reset(f,1);
  for i:=24 to 25 do
    for j:=0 to 7 do
      tank[i,j]:=loadspr1(f);
  close(f);
  assign(f,'enemharv.dat');
  reset(f,1);
  for i:=65 to 66 do{66}
    for j:=0 to 7 do
      tank[i,j]:=loadspr1(f);
  close(f);

  assign(f,'vzr.dat');
  reset(f,1);
  for i:=45 to 45 do
    for j:=0 to 11 do
      tank[i,j]:=loadspr1(f);
  for i:=46 to 46 do
    for j:=0 to 8 do
      tank[i,j]:=loadspr1(f);
  for i:=130 to 130 do
    for j:=0 to 11 do
      houses[i,j]:=loadspr1(f);
  for i:=47 to 47 do
    for j:=0 to 11 do
      tank[i,j]:=loadspr1(f);
  close(f);

  assign(f,'mytur.dat');
  reset(f,1);
  for i:=40 to 41 do
    for j:=0 to 7 do
      tank[i,j]:=loadspr1(f);
  close(f);

  assign(f,'enemtur.dat');
  reset(f,1);
  for i:=70 to 71 do
    for j:=0 to 7 do
      tank[i,j]:=loadspr1(f);
  close(f);

  assign(f,'myair.dat');
  reset(f,1);
  for i:=30 to 33 do
    for j:=0 to 7 do
      tank[i,j]:=loadspr1(f);
  close(f);
  for i:=0 to 7 do
    tank[34,i]:=loadspr('myobs.spr');

  assign(f,'myair3.dat');
  reset(f,1);
  for i:=0 to 7 do
    tank[35,i]:=loadspr1(f);
  close(f);

  assign(f,'myair2.dat');
  reset(f,1);
  for i:=0 to 7 do
    tank[36,i]:=loadspr1(f);
  close(f);

  assign(f,'enemair.dat');
  reset(f,1);
  for i:=76 to 76+3 do
    for j:=0 to 7 do
      tank[i,j]:=loadspr1(f);
  close(f);

  for i:=0 to 7 do
    tank[80,i]:=loadspr('enemobs.spr');

  houses[113,0]:=loadspr('mybuild1.spr');
  houses[111,0]:=loadspr('build2.spr');
  houses[112,0]:=loadspr('build6.spr');
  houses[114,0]:=loadspr('build3.spr');
  houses[115,0]:=loadspr('build4.spr');
  houses[116,0]:=loadspr('remont.spr');
  houses[116,1]:=loadspr('remont1.spr');

  houses[123,0]:=loadspr('build1.spr');
  houses[121,0]:=loadspr('build12.spr');
  houses[122,0]:=loadspr('build10.spr');
  houses[124,0]:=loadspr('build3.spr');
  houses[125,0]:=loadspr('build11.spr');
  houses[126,0]:=loadspr('build13.spr');

  assign(f,'myicons.dat'); {загрузка иконок (всех) }
  reset(f,1);
  for i:=0 to 6 do
      masicon[i]:=loadspr1(f);
  close(f);

  assign(f,'icons2.dat'); {загрузка иконок (всех) }
  reset(f,1);
  for i:=10 to 23 do
      masicon[i]:=loadspr1(f);
  close(f);
  masicon[24]:=tank[27,7];

  bullet[0,0]:=loadspr('bullet.spr');
  bullet[1,0]:=loadspr('rocket.spr');

  assign(f,'vzr2.dat');
  reset(f,1);
  for i:=5 to 6 do
    for j:=0 to 7 do
      bullet[i,j]:=loadspr1(f);
  close(f);

  pict[0]:=loadspr('repair.spr');
  pict[1]:=loadspr('key.spr');
  pict[2]:=loadspr('key2.spr');
  pict[5]:=loadspr('cdut.spr');
  pict[6]:=loadspr('krug.spr');
  pict[7]:=loadspr('krug2.spr');
  pict[8]:=loadspr('krest.spr');

  assign(f,'pict.dat');
  reset(f,1);
  for i:=9 to 11 do
    pict[i]:=loadspr1(f);
  close(f);

  assign(f,'arrow.dat');
  reset(f,1);
  for i:=12 to 15 do
  begin
    pict[i]:=loadspr1(f);
  end;
  close(f);

  pictMove[0]:=loadspr('move.spr');

  assign(f,'smoke.dat');
  reset(f,1);
  for i:=0 to 5 do
    masSmoke[0,i]:=loadspr1(f);
  close(f);

  loadcursors;

  pict[16]:=loadspr('red.spr');
  pict[17]:=loadspr('green.spr');
end;
begin
  GothP:=addr(goth);
  LittP:=addr(Litt);
end.