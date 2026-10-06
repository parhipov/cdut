{$A+,B-,D+,E+,F-,G-,I+,L+,N-,O-,P-,Q+,R+,S+,T-,V+,X+,Y+}
{$M 16384,0,655360}

unit objec2;
interface
uses modul,vx,crt,mouse;
type
  pObject=^tObject;
  tEvent=record
          case Watch:word of
           cmMouse:(xm,ym:longint;
                    button:word);
           cmKey:(key:char;
                  Scan:byte);
           cmEvent:(code:word;
                    otkogo,komu:pObject;
                    x,y,mvx,mvy,oldx,oldy,newx,newy,pow:longint;
                    tip,ang,ras,ground:byte;
                    mov:boolean;
                    tim,dis,dam,sx,sy,step,tm2:integer;
                    buil:pointer);
          end;

    tObject=object
      elem:pObject;   {Указатель на вход в список}
      next:pObject;   {следующий в списке}
      pred:pObject;   {предыдущий}
      last:pObject;   {последний}
      owner:pObject;   {владелец}
      IAm:pObject;   {это я}
      sizex,sizey:integer;{размер по x,y}
      kkk,ramkax,ramkay:integer;{сдвиг рамки}
      sprx,spry:integer;{сдвиг картинки}
      oldx,oldy,x,y,power1,power:integer;
      oldtip,tip,race:byte;
      time3,time2:byte; {стрельба,движение}
      FireTime,GoTime:byte;{время до выстрела,шага}
      dx,dy:integer;{направление по x и y}
      movex,movey:integer;{смещение в зоне по x и y}
      step:byte;         {шаг}
      select:byte;       {1-выбран, 0-нет}
      angle:byte;        {угол поворота}
      moving:boolean;
      flag:boolean; {Ухожу из занятой клетки}
      newx,newy:integer;
      phase,maxphase:byte;
      timephase:integer;
      died:boolean;
      distance:integer;
      oldk:byte;
      flagradar:array[0..1] of boolean;
      tipattack:byte; {кого я могу атаковать}
      tiptar:byte; {кого я атакую}
      gr:byte;
      flagac:array[0..1]of byte;{я был active на др странице}
      kol:byte;
      timerepair:byte;
      repair:pObject;
      flagcloack:boolean;
      cloack:boolean;
      detector:boolean;
      color:byte;
      remont:boolean;
      flagSmoke:byte;
      energy,energy1:integer;{cloack power}
      timeInc:byte;{cloack time}
      load:array[0..1]of boolean;       {флаг загрузки танка}
      kolLoad:byte;{кол-во загруженных}
      constructor Init;
      constructor Init2;
      destructor Done;virtual;
      procedure showRamka(xx,yy,sdv:integer;f1,f2:boolean);
      procedure showLoad(xx,yy:integer);
      procedure message(komu:pObject;var Event:tEvent);
      procedure Show;virtual;
      procedure HandleEvent(var Event:tEvent);virtual;
      procedure GetEvent(var Event:tEvent);
      function itisI(mx,my:integer):boolean;
      function seekTarget(xx,yy,ds:integer):pointer;
      function seekTarget2(var xx,yy:integer;n:integer):pointer;
      procedure save;virtual;
      procedure load2;virtual;
      function nastroika(var p2:pObject;p1:pObject):boolean;
    end;

    pGroup=^tGroup;
    tGroup=object(tObject)
      destructor done;virtual;
      procedure Insert(p:pObject);
      procedure show;virtual;
      procedure HandleEvent(var Event:tEvent);virtual;
      procedure Delete(p,who:pobject);
      procedure save;virtual;
      procedure load2;virtual;
    end;

    pRocet=^tRocet;
    tRocet=object(tObject)
      k,k2:real;
      ddx2,ddy2:integer;
      ddx,ddy,lenx,leny:integer;
      otkogo,kogo:pObject;
      damage:integer;
      target:tTarget;
      pag:byte;
      tip2:byte;
      randomx,randomy:integer;
      constructor init(xx,yy,movx,movy,sx,sy:integer;tar:tTarget;dam:integer;
      kt,otkt:pObject;tp,tp2:byte);
      constructor init2;
      destructor done;virtual;
      procedure HandleEvent(var Event:tEvent);virtual;
      procedure show;virtual;
      procedure save;virtual;
      procedure load2;virtual;
    end;

    pRocet2=^tRocet2;
    tRocet2=object(tObject)
      target:tTarget;
      pag:byte;
      constructor init(xx,yy:integer;tp:byte);
      constructor init2;
      destructor done;virtual;
      procedure HandleEvent(var Event:tEvent);virtual;
      procedure show;virtual;
      procedure save;virtual;
    end;

var
  rocet2,deleting,rocet,myAir,EnemyAir,vibortank,
  ViborAir,desk,mytank,enemytank,myhouse,enemyhouse:pObject;
  viborRobot,myRobot,enemyrobot,smoke,smoke2,MyTurret,EnemyTurret:pObject;
  palet,ss,sel,selhouse:pObject;

implementation

{***************************Object*************************************}
function tObject.nastroika(var p2:pObject;p1:pObject):boolean;
var event2:tEvent;
begin
  event2.code:=cmEvent;
  event2.code:=cmWhoIsIt;
  if p2<>nil
  then begin
    event2.otkogo:=nil;
    event2.watch:=cmevent;
    event2.code:=cmWhoIsIt;
    event2.komu:=p2;
    message(p1,event2);
    if event2.otkogo<>nil
    then begin
      p2:=event2.otkogo;
      nastroika:=true;
    end
    else nastroika:=false;
  end;
end;

constructor tObject.init2;
begin
  next:=nil;last:=nil;elem:=nil;owner:=nil;
  IAm:=@self;
  select:=0;
  flagradar[0]:=true;
  flagradar[1]:=true;
end;

procedure tObject.save;
begin
  IAm:=@self;

{  blockwrite(savefile,elem,sizeof(elem));
  blockwrite(savefile,next,sizeof(next));
  blockwrite(savefile,pred,sizeof(pred));
  blockwrite(savefile,last,sizeof(last));
  blockwrite(savefile,owner,sizeof(owner));}
  blockwrite(savefile,IAm,sizeof(IAm));
  blockwrite(savefile,sizex,sizeof(sizex));
  blockwrite(savefile,sizey,sizeof(sizey));
  blockwrite(savefile,ramkax,sizeof(ramkax));
  blockwrite(savefile,ramkay,sizeof(ramkay));
  blockwrite(savefile,sprx,sizeof(sprx));
  blockwrite(savefile,spry,sizeof(spry));
  blockwrite(savefile,oldx,sizeof(oldx));
  blockwrite(savefile,oldy,sizeof(oldy));
  blockwrite(savefile,x,sizeof(x));
  blockwrite(savefile,y,sizeof(y));
  blockwrite(savefile,power,sizeof(power));
  blockwrite(savefile,power1,sizeof(power1));
  blockwrite(savefile,oldtip,sizeof(oldtip));
  blockwrite(savefile,tip,sizeof(tip));
  blockwrite(savefile,race,sizeof(race));
  blockwrite(savefile,time3,sizeof(time3));
  blockwrite(savefile,time2,sizeof(time2));
  blockwrite(savefile,firetime,sizeof(firetime));
  blockwrite(savefile,gotime,sizeof(gotime));
  blockwrite(savefile,dx,sizeof(dx));
  blockwrite(savefile,dy,sizeof(dy));
  blockwrite(savefile,movex,sizeof(movex));
  blockwrite(savefile,movey,sizeof(movey));
  blockwrite(savefile,step,sizeof(step));
  blockwrite(savefile,select,sizeof(select));
  blockwrite(savefile,angle,sizeof(angle));
  blockwrite(savefile,moving,sizeof(moving));
  blockwrite(savefile,flag,sizeof(flag));
  blockwrite(savefile,newx,sizeof(newx));
  blockwrite(savefile,newy,sizeof(newy));
  blockwrite(savefile,kkk,sizeof(kkk));
  blockwrite(savefile,phase,sizeof(phase));
  blockwrite(savefile,maxphase,sizeof(maxphase));
  blockwrite(savefile,timephase,sizeof(timephase));
  blockwrite(savefile,died,sizeof(died));
  blockwrite(savefile,distance,sizeof(distance));
  blockwrite(savefile,oldk,sizeof(oldk));
{  blockwrite(savefile,flagradar,sizeof(flagradar));}
  blockwrite(savefile,tipattack,sizeof(tipattack));
  blockwrite(savefile,tiptar,sizeof(tiptar));
  blockwrite(savefile,gr,sizeof(gr));
  blockwrite(savefile,flagac,sizeof(flagac));
  blockwrite(savefile,kol,sizeof(kol));
  blockwrite(savefile,timerepair,sizeof(timerepair));
  blockwrite(savefile,repair,sizeof(repair));
  blockwrite(savefile,flagcloack,sizeof(flagcloack));
  blockwrite(savefile,cloack,sizeof(cloack));
  blockwrite(savefile,detector,sizeof(detector));
  blockwrite(savefile,color,sizeof(color));
  blockwrite(savefile,remont,sizeof(remont));
  blockwrite(savefile,flagsmoke,sizeof(flagsmoke));
  blockwrite(savefile,energy,sizeof(energy));
  blockwrite(savefile,energy1,sizeof(energy1));
  blockwrite(savefile,timeinc,sizeof(timeinc));
  blockwrite(savefile,load,sizeof(load));
  blockwrite(savefile,kolload,sizeof(kolload));
end;

procedure tObject.load2;
begin
{  blockread(loadfile,elem,sizeof(elem));
  blockread(loadfile,next,sizeof(next));
  blockread(loadfile,pred,sizeof(pred));
  blockread(loadfile,last,sizeof(last));
  blockread(loadfile,owner,sizeof(owner));}
  blockread(loadfile,IAm,sizeof(IAm));
  blockread(loadfile,sizex,sizeof(sizex));
  blockread(loadfile,sizey,sizeof(sizey));
  blockread(loadfile,ramkax,sizeof(ramkax));
  blockread(loadfile,ramkay,sizeof(ramkay));
  blockread(loadfile,sprx,sizeof(sprx));
  blockread(loadfile,spry,sizeof(spry));
  blockread(loadfile,oldx,sizeof(oldx));
  blockread(loadfile,oldy,sizeof(oldy));
  blockread(loadfile,x,sizeof(x));
  blockread(loadfile,y,sizeof(y));
  blockread(loadfile,power,sizeof(power));
  blockread(loadfile,power1,sizeof(power1));
  blockread(loadfile,oldtip,sizeof(oldtip));
  blockread(loadfile,tip,sizeof(tip));
  blockread(loadfile,race,sizeof(race));
  blockread(loadfile,time3,sizeof(time3));
  blockread(loadfile,time2,sizeof(time2));
  blockread(loadfile,firetime,sizeof(firetime));
  blockread(loadfile,gotime,sizeof(gotime));
  blockread(loadfile,dx,sizeof(dx));
  blockread(loadfile,dy,sizeof(dy));
  blockread(loadfile,movex,sizeof(movex));
  blockread(loadfile,movey,sizeof(movey));
  blockread(loadfile,step,sizeof(step));
  blockread(loadfile,select,sizeof(select));
  blockread(loadfile,angle,sizeof(angle));
  blockread(loadfile,moving,sizeof(moving));
  blockread(loadfile,flag,sizeof(flag));
  blockread(loadfile,newx,sizeof(newx));
  blockread(loadfile,newy,sizeof(newy));
  blockread(loadfile,kkk,sizeof(kkk));
  blockread(loadfile,phase,sizeof(phase));
  blockread(loadfile,maxphase,sizeof(maxphase));
  blockread(loadfile,timephase,sizeof(timephase));
  blockread(loadfile,died,sizeof(died));
  blockread(loadfile,distance,sizeof(distance));
  blockread(loadfile,oldk,sizeof(oldk));
{  blockread(loadfile,flagradar,sizeof(flagradar));}
  blockread(loadfile,tipattack,sizeof(tipattack));
  blockread(loadfile,tiptar,sizeof(tiptar));
  blockread(loadfile,gr,sizeof(gr));
  blockread(loadfile,flagac,sizeof(flagac));
  blockread(loadfile,kol,sizeof(kol));
  blockread(loadfile,timerepair,sizeof(timerepair));
  blockread(loadfile,repair,sizeof(repair));
  blockread(loadfile,flagcloack,sizeof(flagcloack));
  blockread(loadfile,cloack,sizeof(cloack));
  blockread(loadfile,detector,sizeof(detector));
  blockread(loadfile,color,sizeof(color));
  blockread(loadfile,remont,sizeof(remont));
  blockread(loadfile,flagsmoke,sizeof(flagsmoke));
  blockread(loadfile,energy,sizeof(energy));
  blockread(loadfile,energy1,sizeof(energy1));
  blockread(loadfile,timeinc,sizeof(timeinc));
  blockread(loadfile,load,sizeof(load));
  blockread(loadfile,kolload,sizeof(kolload));
end;

function tObject.seekTarget2(var xx,yy:integer;n:integer):pointer;
var i,j:integer;
    event2:tEvent;
begin
  seekTarget2:=nil;
  xx:=0;yy:=0;
  if n=0 then
    for i:=maxx downto 0 do
      for j:=maxy downto 0 do
        if (pole[i,j,0] in[110..120])
        then begin
          event2.watch:=cmEvent;
          event2.code:=cmWho2;
          event2.ras:=0;
          event2.x:=i;event2.y:=j;
          message(myhouse,event2);
          if event2.code=cmItIsWho
          then begin
            seekTarget2:=event2.otkogo;
            xx:=i;
            yy:=j;
            exit;
          end;
        end;
end;

function tObject.seekTarget(xx,yy,ds:integer):pointer;
var i,j,xx2,yy2,xx1,yy1:integer;
    event2:tEvent;
    p:pointer;
begin
  i:=ds div 40;
  j:=ds div 40;
  p:=nil;
  if (xx-i<0)then xx1:=0 else xx1:=xx-i;
  if (xx+i>maxx)then xx2:=maxx else xx2:=xx+i;
  if (yy-j<0)then yy1:=0 else yy1:=yy-j;
  if (yy+j>maxy)then yy2:=maxy else yy2:=yy+j;
  event2.watch:=cmEvent;
  for i:=xx1 to xx2-1 do
    for j:=yy1 to yy2-1 do
    begin
      if((tipattack=1)or(tipattack=2))and
{        ((pole[i,j,1] in [30..39])or(pole[i,j,1] in [76..80]))}
        (((race=1)and(pole[i,j,1] in [30..39]))or((race=0)and(pole[i,j,1] in [76..80])))
      then
      begin
        event2.code:=cmWho2;
        event2.ras:=1-race;
        event2.x:=i;event2.y:=j;
        if detector then event2.pow:=111;
        if race=1 then begin
          message(viborair,event2);
          if (event2.code<>cmitIsWho)then message(myair,event2);
        end
        else  if race=0 then begin
               message(enemyair,event2);
              end;
        if event2.code=cmitIsWho
        then begin
              p:=event2.otkogo;
              seekTarget:=p;
              exit
             end;
      end;

      if ((tipattack=0)or(tipattack=2))
{      and((pole[i,j,0] in [23..29])or(pole[i,j,0]in[40..44,70..74])
      or(pole[i,j,0]in[205..206])or(pole[i,j,0]in[60..70]))}
      and(((race=1)and(pole[i,j,0]in[23..29,40..44,205]))
      or(race=0)and(pole[i,j,0]in[60..74,121..130,206]))
      then
      begin
        event2.code:=cmWho2;
        event2.ras:=1-race;
        event2.x:=i;event2.y:=j;
        if detector then event2.pow:=111;
        if race=1 then begin
          message(vibortank,event2);
          if (event2.code<>cmitIsWho)then message(myTank,event2);
          if (event2.code<>cmitIsWho)then message(myTurret,event2);
          if (event2.code<>cmitIsWho)then message(vibortank,event2);
          if (event2.code<>cmitIsWho)then message(myTurret,event2);
          if (event2.code<>cmitIsWho)then message(viborRobot,event2);
          if (event2.code<>cmitIsWho)then message(myRobot,event2);
        end
        else  if race=0 then begin
               if (event2.code<>cmitIsWho)then message(enemyTurret,event2);
               if (event2.code<>cmitIsWho)then message(enemytank,event2);
               if (event2.code<>cmitIsWho)then message(enemyRobot,event2);
              end;
        if (event2.code=cmitIsWho)
        then begin
              p:=event2.otkogo;
              seekTarget:=p;
              exit
             end;
      end;
    end;

  for i:=xx1 to xx2-1 do
    for j:=yy1 to yy2-1 do
    begin
      if ((tipattack=0)or(tipattack=2))and(pole[i,j,0]in[110..129,200..201,205..206])
      then
      begin
        event2.code:=cmWho2;
        event2.ras:=1-race;
        event2.x:=i;event2.y:=j;
        if race=1 then begin
          message(myhouse,event2);
        end
        else  if race=0 then begin
               message(enemyhouse,event2);
              end;
        if (event2.code=cmitIsWho)
        then begin
              p:=event2.otkogo;
              seekTarget:=p;
              exit
             end;
      end;
  end;
  seekTarget:=p;
end;

procedure tObject.message(komu:pObject;var Event:tEvent);
begin
{  aa:=tip;
  bb:=race;
  cc:=cc+1;}
  komu^.handleevent(event);
end;

function tObject.itisI(mx,my:integer):boolean;
var k:integer;
begin
  itisi:=false;
  if tip in[30..39,76..80] then k:=-kkk else k:=0;
  if (((x-polex)*40+movex*step+sprx<mx)and((x-polex)*40+sizex+movey*step>mx)
  and((y-poley)*40+movey*step+k+spry<my)and((y-poley)*40+sizey+movey*step+k>my))then
    itisi:=true;
end;

procedure tObject.GetEvent(var Event:tEvent);
var event2:tEvent;
begin
{  if Event.watch=cmEvent then exit;}
   key:=#0;
   if (keypressed)
    then begin
      key:=readkey;
      end;

  if (shift)and(key in['!','@','#','$','%','^','&','*','(',')'])
  then begin
    event2.watch:=cmEvent;
    event2.code:=cmUnGroup;
    event2.tip:=nomer(key);
    message(myTank,event2);
    message(myAir,event2);
    message(myRobot,event2);
    event2.code:=cmGroup;
    message(viborTank,event2);
    message(viborAir,event2);
    message(viborRobot,event2);
  end
  else
    if key<>#0
    then begin
       Event.watch:=cmKey;
       Event.Key:=key;
       key:=Event.key;
       end
  else begin
    Event.Watch:=cmMouse;
    Event.xm:=mousex;Event.ym:=mousey;Event.button:=mousebutton;
{    MouseRead(Event.xm,Event.ym,Event.button);}
    if event.button=2 then begin
      sel:=nil;
    end;
  end;
end;

procedure tObject.HandleEvent(var Event:tEvent);
begin
end;

destructor tObject.done;
begin
  pred^.next:=next;
  next^.pred:=pred;
  if owner^.last=@self
  then
    owner^.last:=next;
  if owner^.elem=@self
  then
    owner^.elem:=next;
  if (Owner^.last)=(Owner^.elem)
  then
    Owner^.elem:=Owner^.last^.next;
  if(pred=next)and(@self=next)
  then begin
    owner^.elem:=nil;
    owner^.last:=nil;
  end;

  if (race=0)and(myhouse^.elem=nil)and(mytank^.elem=nil)and(myRobot^.elem=nil)
  and(viborRobot^.elem=nil)
  and(myair^.elem=nil)and(myturret^.elem=nil)and(vibortank^.elem=nil)
  and(viborair^.elem=nil)and not(victory)
  then failed:=true;
  if (race=1)and(enemyhouse^.elem=nil)and(enemytank^.elem=nil)and(enemyRobot^.elem=nil)
  and(enemyair^.elem=nil)and(enemyturret^.elem=nil)and not(failed)
  then victory:=true;

end;

constructor tObject.init;
begin
  next:=nil;last:=nil;elem:=nil;owner:=nil;
  IAm:=@self;
  select:=0;
end;

procedure tObject.ShowRamka(xx,yy,sdv:integer;f1,f2:boolean);
var len,s:integer;
    k:byte;
begin
  if f1 then s:=6 else s:=0;
  if race=0 then setcolor(white)
  else setcolor(12);
  line(xx+ramkax,yy+ramkay-kkk,xx+ramkax+4,yy+ramkay-kkk);
  line(xx+ramkax,yy+ramkay-kkk,xx+ramkax,yy+ramkay+10-kkk);
  line(xx+ramkax+sizex,yy+ramkay-kkk+sizey,xx+ramkax-10+s+sizex,yy+sizey-kkk+ramkay);
  line(xx+ramkax+sizex,yy+ramkay-kkk+sizey,xx+ramkax+sizex,yy-10+sizey-kkk+ramkay);
  line(xx+ramkax+sizex,yy+ramkay-kkk,xx+ramkax-4+sizex,yy-kkk+ramkay);
  line(xx+ramkax+sizex,yy+ramkay-kkk,xx+ramkax+sizex,yy+10-kkk+ramkay);
  line(xx+ramkax,yy+ramkay+sizey-kkk,xx+ramkax+10-s,yy+sizey-kkk+ramkay);
  line(xx+ramkax,yy+ramkay+sizey-kkk,xx+ramkax,yy-10+sizey-kkk+ramkay);

  if not f2 then k:=15 else k:=20;
  if race=0 then rectangle(xx+ramkax+4,sdv+yy+ramkay-kkk-2,xx+ramkax+sizex-4,sdv+yy+ramkay-kkk+2,k,k)
  else rectangle(xx+ramkax+4,sdv+yy+ramkay-kkk-2,xx+ramkax+sizex-4,sdv+yy+ramkay-kkk+2,12,12);

  if not f2
  then begin
    len:=round(power/power1*(sizex-10));
    if len>=1 then setcolor(red);
    if len>=(sizex-10)*1/3 then setcolor(yellow);
    if len>=(sizex-10)*2/3 then setcolor(green);
  end
  else begin
    len:=round(energy/energy1*(sizex-10));
    if gr=1 then setcolor(167)
    else setcolor({167}143);
  end;
  if len+5>=sizex div 2 then begin
    line(xx+ramkax+5,sdv+yy+ramkay-kkk-1,xx+ramkax+sizex div 2,sdv+yy+ramkay-kkk-1);
    line(xx+ramkax+5,sdv+yy+ramkay-kkk,xx+ramkax+sizex div 2,sdv+yy+ramkay-kkk);
    line(xx+ramkax+5,sdv+yy+ramkay-kkk+1,xx+ramkax+sizex div 2,sdv+yy+ramkay-kkk+1);

    line(xx+ramkax+sizex div 2,sdv+yy+ramkay-kkk-1,xx+ramkax+sizex div 2+len-(sizex-10)div 2,sdv+yy+ramkay-kkk-1);
    line(xx+ramkax+sizex div 2,sdv+yy+ramkay-kkk,xx+ramkax+sizex div 2+len-(sizex-10)div 2,sdv+yy+ramkay-kkk);
    line(xx+ramkax+sizex div 2,sdv+yy+ramkay-kkk+1,xx+ramkax+sizex div 2+len-(sizex-10)div 2,sdv+yy+ramkay-kkk+1);
  end
  else
  begin
    line(xx+ramkax+5,sdv+yy+ramkay-kkk-1,xx+ramkax+len+5,sdv+yy+ramkay-kkk-1);
    line(xx+ramkax+5,sdv+yy+ramkay-kkk,xx+ramkax+len+5,sdv+yy+ramkay-kkk);
    line(xx+ramkax+5,sdv+yy+ramkay-kkk+1,xx+ramkax+len+5,sdv+yy+ramkay-kkk+1)
  end
end;

procedure tObject.ShowLoad(xx,yy:integer);
var kx1,ky1,kx2,ky2,i:integer;
begin
  setcolor(91);
  for i:=1 to maxLoad do
  begin
    kx1:=xx+7*i+ramkax-2;
    ky1:=yy+sizey-1;
    kx2:=xx+7*i+5+ramkax-2;
    ky2:=yy+sizey+2;

    if kx1<0 then kx1:=0;
    if ky1<0 then ky1:=0;
    if kx2>519 then kx2:=519;
    if ky2>479 then kx2:=479;
    if (kx2>0)and(ky2>0)and(kx1<520)and(ky1<640)
    then begin
      if i<=kolLoad
      then bar(kx1,ky1,kx2,ky2)
      else rectangle(kx1,ky1,kx2,ky2,15,15);
    end;
  end;
end;

procedure tObject.show;
var xm,ym,but:word;
    len,k,xx,yy:integer;
    f:boolean;
    event2:tEvent;
begin
{  if pole2[x,y]=0 then
    exit;}
  if (angle=25)or(load[1])then
    exit;
  if ((x>=polex-1)and(x<=polex+13))and((y>=poley-1)and(y<=poley+12)) then
  begin
    f:=true;
    MouseRead(xm,ym,but);
{    if (((x-polex)*40+movex*step<xm) and ((x-polex)*40+40+movex*step>xm)
    and ((y-poley)*40+movey*step<ym) and ((y-poley)*40+40+movey*step>ym))then
      f:=true;}
    if f then hidemouse;
    xx:=(x-polex)*40+movex*step+sprx;yy:=(y-poley)*40+movey*step+spry;
{    aa:=xx;bb:=yy;cc:=tip;dd:=angle;}
{    if tip in [30..32] then k:=kkk else k:=0;}
{    if shadow then}
    if not flagcloack then
    if (tip in[30..36,76..80,46,47])then putsprites(xx,yy,tank[tip,angle]);
{46,47 - коды взрывов        ^^^^^  }
{    else putsprites(xx,yy+2,tank[tip,angle]);}
    if not flagcloack then putsprite(xx,yy-kkk,tank[tip,angle])
    else begin
      if race=0 then putsprites(xx,yy-kkk,tank[tip,angle])
      else
      begin
        event2.mov:=false;event2.watch:=cmEvent;
        event2.code:=cmIAmCloack;event2.x:=x;event2.y:=y;
        event2.mov:=true;
        if race=0
        then begin
          message(enemytank,event2);
          message(enemyRobot,event2);
          message(enemyair,event2);
          message(enemyturret,event2);
        end;
        if race=1
        then begin
          message(mytank,event2);
          message(myRobot,event2);
          message(myair,event2);
          message(vibortank,event2);
          message(viborair,event2);
          message(myturret,event2);
          message(viborRobot,event2);
        end;
        if not event2.mov then putsprites(xx,yy-kkk,tank[tip,angle])
      end;
    end;
    if (remont)and not(died)
    then putsprite(xx+10,yy+10,pict[1+movex]);
{    if not shadow then}
    if select=1
    then begin
      if tip in[35]
      then showLoad(xx,yy-kkk);
      if (energy1<>0)and(race=0)
      then begin
        showRamka(xx,yy,sizey-1,true,true);
        showRamka(xx,yy,0,true,false);
      end
      else showRamka(xx,yy,0,false,false);;
    end;
    if f then showmouse;
  end;
end;

{***************************Group*********************************}
procedure tGroup.save;
var w:word;
begin
  inherited save;
end;

procedure tGroup.load2;
var w:word;
begin
  inherited load2;
end;

procedure tGroup.Insert(p:pObject);
var t:pObject;
begin
      t:=last;p^.Owner:=@Self;
      if last=nil
      then begin
        p^.next:=p;
        p^.pred:=p;
        elem:=p;
        last:=p;
      end
      else begin
             p^.next:=last^.next;
             p^.pred:=last;
             last^.next^.pred:=p;
             last^.next:=p;
             last:=p;
           end;
end;

procedure tGroup.delete(p,who:pobject);
begin
  if(p^.next=p^.pred)and(p^.pred=p)
  then begin
    who^.elem:=nil;
    who^.last:=nil;
  end;
  p^.pred^.next:=p^.next;
  p^.next^.pred:=p^.pred;
  if who^.last=p then who^.last:=p^.next;
  if who^.elem=p then who^.elem:=p^.next;
  if (who^.last=who^.elem)and(who^.elem<>nil) then
    who^.elem:=who^.last^.next;
  p^.next:=nil;p^.pred:=nil;
end;

procedure tGroup.HandleEvent(var Event:tEvent);
var pp:pObject;
    event2:tEvent;
    i,num:integer;
    s:string;

  procedure handle(inp,p:pObject);
  begin
    if p^.next<>inp then handle(inp,p^.next);
    p^.handleevent(event);
  end;

begin
  ss:=@self;
  if event.watch=cmEvent then
  begin
    if event.code=cmLoadf
    then begin
      if elem<>nil
      then begin
        pp:=last;
        repeat
          pp:=pp^.next;
          pp^.load2;
        until pp=last;
      end;
      exit;
    end;

    if event.code=cmSave
    then begin
      num:=0;
      if elem<>nil
      then begin
        pp:=last;
        repeat
          pp:=pp^.next;
          inc(num);
        until pp=last;
      end;

      s:='kissmyass';
      blockwrite(savefile,s,10);
      blockwrite(savefile,num,sizeof(num));{запись количества
      объектов в списке}

      if elem<>nil
      then begin
        pp:=last;
        repeat
          pp:=pp^.next;
          pp^.save;
        until pp=last;
      end;
      exit;
    end;
    if event.code=cmInsertToVibor then
    begin
      if Event.otkogo^.select=0 then
      begin
        delete(Event.otkogo,@self);
        Event.otkogo^.select:=1;
        if (Event.tip in[24..25])then pgroup(viborRobot)^.insert(Event.otkogo);
        if (Event.tip<=29)and not(event.tip in[24..25])
          then pgroup(viborTank)^.insert(Event.otkogo);
        if (Event.tip>=30)then pgroup(viborAir)^.insert(Event.otkogo);
      end
      else
      begin
        event2.watch:=cmEvent;
        event2.code:=cmUnSelect;
        message(event.otkogo,event2);
        if (Event.tip in[24..25])then begin
          delete(Event.otkogo,viborRobot);
          pgroup(MyRobot)^.insert(Event.otkogo);
        end;
        if (Event.tip<=29)and not(event.tip in[24..25])then begin
          delete(Event.otkogo,vibortank);
          pgroup(MyTank)^.insert(Event.otkogo);
        end;
        if (Event.tip>=30)then begin
          delete(Event.otkogo,viborair);
          pgroup(MyAir)^.insert(Event.otkogo);
        end;
      end;
      event.watch:=cmNothing;
      exit;
    end;
    if Event.code=cmDel then
    begin
{      delete(Event.otkogo);
      dispose(Event.otkogo,done);
      Event.watch:=cmNothing;}
      delete(Event.otkogo,@self);
      pgroup(deleting)^.insert(Event.otkogo);
      exit;
    end;
  end;
  if elem<>nil then handle(elem,elem);
end;

procedure tGroup.show;
var pp:pObject;
begin
  pp:=last;
  if pp=nil then exit;
  repeat
    pp:=pp^.next;
    pp^.show;
  until pp=last
end;

destructor tGroup.done;
var pp:pObject;
begin
{  sel:=@self;}
  if elem<>nil
  then begin
(*{  pp:=last;}
    repeat
  {    pp:=pp^.next;}
      dispose(last^.next,done);
    until (elem=nil);*)

    pp:=last;{из DeskTop-a}
    repeat
      pp:=elem^.next;
      dispose(pp,done);
    until (elem=nil);

  end;
  pred^.next:=next;
  next^.pred:=pred;
  if owner^.last=@self
  then
    owner^.last:=next;
  if owner^.elem=@self
  then
    owner^.elem:=next;
  if(pred=next)and(@self=next)
  then
    owner^.elem:=nil;
end;

{***********************Rocet************************}
procedure tRocet.save;
begin
  inherited save;
  blockwrite(savefile,k,sizeof(k));
  blockwrite(savefile,k2,sizeof(k2));
  blockwrite(savefile,ddx2,sizeof(ddx2));
  blockwrite(savefile,ddy2,sizeof(ddy2));
  blockwrite(savefile,ddx,sizeof(ddx));
  blockwrite(savefile,ddy,sizeof(ddy));
  blockwrite(savefile,lenx,sizeof(lenx));
  blockwrite(savefile,leny,sizeof(leny));
{}  blockwrite(savefile,otkogo,sizeof(otkogo));
{}  blockwrite(savefile,kogo,sizeof(kogo));
  blockwrite(savefile,damage,sizeof(damage));
{}  blockwrite(savefile,target,sizeof(target));
  blockwrite(savefile,pag,sizeof(pag));
  blockwrite(savefile,tip2,sizeof(tip2));
  blockwrite(savefile,randomx,sizeof(randomx));
  blockwrite(savefile,randomy,sizeof(randomy));
end;

procedure tRocet.load2;
begin
  inherited load2;
  blockread(loadfile,k,sizeof(k));
  blockread(loadfile,k2,sizeof(k2));
  blockread(loadfile,ddx2,sizeof(ddx2));
  blockread(loadfile,ddy2,sizeof(ddy2));
  blockread(loadfile,ddx,sizeof(ddx));
  blockread(loadfile,ddy,sizeof(ddy));
  blockread(loadfile,lenx,sizeof(lenx));
  blockread(loadfile,leny,sizeof(leny));
{}  blockread(loadfile,otkogo,sizeof(otkogo));
{}  blockread(loadfile,kogo,sizeof(kogo));
  blockread(loadfile,damage,sizeof(damage));
{}  blockread(loadfile,target,sizeof(target));
  blockread(loadfile,pag,sizeof(pag));
  blockread(loadfile,tip2,sizeof(tip2));
  blockread(loadfile,randomx,sizeof(randomx));
  blockread(loadfile,randomy,sizeof(randomy));
end;

destructor tRocet.done;
begin
  inherited done;
end;

constructor tRocet.init2;
begin
end;

constructor tRocet.init(xx,yy,movx,movy,sx,sy:integer;tar:tTarget;dam:integer;kt,otkt:pObject;tp,tp2:byte);
begin
  tip:=tp;
  tip2:=tp2;
  x:=xx;y:=yy;
  oldx:=xx;oldy:=yy;
  movex:=movx;movey:=movy;
  sizex:=sx;sizey:=sy;
  target:=tar;
  kogo:=kt;
  otkogo:=otkt;
  step:=rocetstep;
  damage:=dam;
  kkk:=0;
  k:=(step/rasst(x,y,target.x,target.y));
  ddx:=round(k*abs(target.x-x));
  ddy:=round(k*abs(target.y-y));
  dy:=0;dx:=0;
  case tip of
    1:begin
        lenx:=10;
      end;
    2:begin
        lenx:=5;
      end;
  end;
  k2:=(lenx/rasst(x,y,target.x,target.y));
  ddx2:=round(k2*abs(target.x-x));
  ddy2:=round(k2*abs(target.y-y));
  died:=false;
  timephase:=timep;
  phase:=0;maxphase:=7;
  pag:=0;
  randomx:=random(10);
  randomy:=random(10);
end;

procedure tRocet.show;
begin
  if (died)and(phase>16) then
    exit;
  if (died)and(phase<maxphase) then
  begin
    hidemouse;
    putsprite(x-polex*40+movex-5,y-poley*40+movey-5,bullet[tip,phase]);
    showmouse;
  end;
  if ((x-polex*40+movex)>0)and((y-poley*40+movey)>0)and((x-polex*40+sizex+movex)<520)and(y-poley*40+sizey+movey<480)
  and not(died)
  then
{    putsprite(x-polex*40+movex,y-poley*40+movey,bullet[0,0]);}
  begin
    case tip of
      1:begin
          SetColor(red);
          line(x-polex*40+movex,y-poley*40+movey-1,x-polex*40+ddx2*dx+movex,y-poley*40+ddy2*dy+movey-1);
          line(x-polex*40+movex,y-poley*40+movey+1,x-polex*40+ddx2*dx+movex,y-poley*40+ddy2*dy+movey+1);
          SetColor(yellow);
          line(x-polex*40+movex,y-poley*40+movey,x-polex*40+ddx2*dx+movex,y-poley*40+ddy2*dy+movey);
        end;
      2:begin
          SetColor(96);
          line(x-polex*40+movex,y-poley*40+movey-1,x-polex*40+ddx2*dx+movex,y-poley*40+ddy2*dy+movey-1);
          line(x-polex*40+movex,y-poley*40+movey+1,x-polex*40+ddx2*dx+movex,y-poley*40+ddy2*dy+movey+1);
          SetColor(120);
          line(x-polex*40+movex,y-poley*40+movey,x-polex*40+ddx2*dx+movex,y-poley*40+ddy2*dy+movey);
        end;
      0,3:begin
          hidemouse;
          putsprite(x-polex*40+movex,y-poley*40+movey,bullet[0,0]);
          showmouse;
        end;
      4:begin
          hidemouse;
          putsprite(x-polex*40+movex,y-poley*40+movey,bullet[1,0]);
          showmouse;
        end;
    end;
  end;
{    bar(x-polex*40+movex,y-poley*40+movey,x-polex*40+movex+sizex,y-poley*40+sizey+movey);}
end;

procedure tRocet.HandleEvent(var Event:tEvent);
var xx,yy:integer;
    event2:tEvent;
    f4:boolean;
begin
  modifpole2(x div 40,y div 40,1);
  modifpole2(oldx div 40,oldy div 40,1);
  if event.watch=cmEvent then
  begin
    case event.code of
      cmRestore:begin
           if kogo<>nil
           then begin
             f4:=nastroika(kogo,enemyTank);
             if not f4 then f4:=nastroika(kogo,myTank);
             if not f4 then f4:=nastroika(kogo,viborTank);
             if not f4 then f4:=nastroika(kogo,myAir);
             if not f4 then f4:=nastroika(kogo,viborAir);
             if not f4 then f4:=nastroika(kogo,myTurret);
             if not f4 then f4:=nastroika(kogo,myHouse);
             if not f4 then f4:=nastroika(kogo,myRobot);
             if not f4 then f4:=nastroika(kogo,viborRobot);
             if not f4 then f4:=nastroika(kogo,enemyAir);
             if not f4 then f4:=nastroika(kogo,enemyTurret);
             if not f4 then f4:=nastroika(kogo,enemyHouse);
             if not f4 then f4:=nastroika(kogo,enemyRobot);
           end;
           if otkogo<>nil
           then begin
             f4:=nastroika(otkogo,enemyTank);
             if not f4 then f4:=nastroika(otkogo,myTank);
             if not f4 then f4:=nastroika(otkogo,viborTank);
             if not f4 then f4:=nastroika(otkogo,myAir);
             if not f4 then f4:=nastroika(otkogo,viborAir);
             if not f4 then f4:=nastroika(otkogo,myTurret);
             if not f4 then f4:=nastroika(otkogo,myHouse);
             if not f4 then f4:=nastroika(otkogo,myRobot);
             if not f4 then f4:=nastroika(otkogo,viborRobot);
             if not f4 then f4:=nastroika(otkogo,enemyAir);
             if not f4 then f4:=nastroika(otkogo,enemyTurret);
             if not f4 then f4:=nastroika(otkogo,enemyHouse);
             if not f4 then f4:=nastroika(otkogo,enemyRobot);
           end;
         end;
      cmIAmDied:begin
                  if Event.otkogo=otkogo then
                  otkogo:=nil;
                  if event.otkogo=kogo then
                  kogo:=nil;
                end;
    end;
  end;
  if died then begin
    if timephase>0 then dec(timephase)
    else begin
      inc(phase);
      timephase:=timep;
{      if phase<=maxphase
      then begin
      end;}
      if phase=maxphase+2 then
      begin
        event.watch:=cmEvent;
        Event.otkogo:=@self;
        event.code:=cmDel;
        message(owner,event);
        event.watch:=cmNothing;
      end;
    end;
  end;
  if pag=0 then
  begin
    if target.watch=cmKoord then begin
      xx:=target.x+randomx;yy:=target.y+randomy;
    end;
    if (tip in[3,1,2])and(kogo<>nil)and(tip2=1)
    then begin
      target.x:=pObject(kogo)^.x*40+15+randomx;
      target.y:=pObject(kogo)^.y*40-10+randomy;
      xx:=target.x;yy:=target.y;
    end;
    oldx:=x;oldy:=y;
    k:=(step/rasst(x,y,xx,yy));
    ddx:=round(k*abs(xx-x));
    ddy:=round(k*abs(yy-y));
    if xx>x then dx:=1;
    if xx<x then dx:=-1;
    if yy>y then dy:=1;
    if yy<y then dy:=-1;
    x:=x+dx*ddx;y:=y+dy*ddy;
    if (x>xx)and(dx=1) then x:=xx;
    if (x<xx)and(dx=-1) then x:=xx;
    if (y>yy)and(dy=1) then y:=yy;
    if (y<yy)and(dy=-1) then y:=yy;
  end;
  if (x=xx)and(y=yy)and(not Died)
  then begin
    pag:=1;
    died:=true;
    if tip in[1,3,4]then tip:=6;
    if tip in[2,0]then tip:=5;
    phase:=0;
    event2.watch:=cmEvent;
    event2.code:=cmDecPower;
    event2.pow:=damage;
    event2.x:=x div 40;
    event2.y:=y div 40;
    Event2.otkogo:=otkogo;
    event2.komu:=kogo;
    event2.tip:=tip2;
    if kogo<>nil then
      message(kogo,event2);
  end;
end;

{***********************Rocet2************************}
procedure tRocet2.save;
begin
  inherited save;
  blockwrite(savefile,target,sizeof(target));
  blockwrite(savefile,pag,sizeof(pag));
end;

destructor tRocet2.done;
begin
  inherited done;
end;

constructor tRocet2.init2;
begin
end;

constructor tRocet2.init(xx,yy:integer;tp:byte);
begin
  tip:=tp;
  died:=false;
  timephase:=timep;
  phase:=0;maxphase:=7;
  pag:=0;
  x:=xx;
  y:=yy;
  target.x:=x;
  target.y:=y+20;
end;

procedure tRocet2.show;
begin
  if (died)and(phase>16) then
    exit;
  if (died)and(phase<maxphase) then
  begin
    hidemouse;
    putsprite(x-polex*40-20,y-poley*40-20,tank[tip,phase]);
    showmouse;
  end;
  if (x-polex*40>0)and(y-poley*40>0)and(x-polex*40<520)and(y-poley*40<480)
  and not(died)
  then
{    putsprite(x-polex*40+movex,y-poley*40+movey,bullet[0,0]);}
  begin
    case tip of
      7:begin
          hidemouse;
          putsprite(x-polex*40,y-poley*40,bullet[1,0]);
          showmouse;
      end;
    end;
  end;
{    bar(x-polex*40+movex,y-poley*40+movey,x-polex*40+movex+sizex,y-poley*40+sizey+movey);}
end;

procedure tRocet2.HandleEvent(var Event:tEvent);
var xx,yy:integer;
    event2:tEvent;
begin
  modifpole2(x div 40,y div 40,1);
  if died
  then begin
    if timephase>0 then dec(timephase)
    else begin
      inc(phase);
      timephase:=timep;
{      if phase<=maxphase
      then begin
      end;}
      if phase=maxphase+2 then
      begin
        event.watch:=cmEvent;
        Event.otkogo:=@self;
        event.code:=cmDel;
        message(owner,event);
        event.watch:=cmNothing;
      end;
    end;
  end;
  if pag=0 then
  begin
    if x<target.x then inc(x);
    if y<target.y-1
    then y:=y+2;
  end;
  if (x=target.x)and(y=target.y)and(not died)
  then begin
    pag:=1;
    died:=true;
    if random(10)<5
    then tip:=47
    else tip:=45;
    phase:=0;
{    event2.watch:=cmEvent;
    event2.code:=cmDecPower;
    event2.pow:=damage;
    event2.x:=x div 40;
    event2.y:=y div 40;
    Event2.otkogo:=otkogo;
    event2.komu:=kogo;
    event2.tip:=tip2;
    if kogo<>nil then
      message(kogo,event2);}
  end;
end;

begin
end.