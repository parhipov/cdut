{$A+,B-,D+,E+,F-,G-,I+,L+,N-,O-,P-,Q+,R+,S+,T-,V+,X+,Y+}
{$M 16384,0,655360}
Unit Objec;
interface
uses modul,objec2,vx,crt,mouse,palitra;
type
    pTech=^tTech;
    tTech=object(tObject)
      damage:integer;
      target:pObject;
      attack:boolean;
      tarx,tary:longint;
      pag:byte;
      tiprocet:byte;
      angletime:integer;
      gruppa:tGruppa;
      sost:byte;
      pousetime:integer;
      sxx,syy:byte;
      builder:pObject;
      ktime,flagk,maxk:byte;
      flagsost:boolean;
      oldradar:boolean;
      oldnewx,oldnewy:integer;
{      oldnewx2,oldnewy2:integer;}
      defender:boolean;
      defenHouse:pObject;   {здание, которое защищаю}
      sostWay:byte;
      flagfff:boolean;
      remontTime:integer;
      patr:boolean;
      timeSmoke:byte;
      chrono:boolean;
      chron:array[0..2]of byte;
      masLoad:array[1..maxLoad]of pObject;
      masLoad2:array[1..maxLoad]of pObject;
      constructor Init;
      constructor Init2;
      destructor Done;virtual;
      procedure show;virtual;
      procedure HandleEvent(var Event:tEvent);virtual;
      procedure group(xx:byte);
      procedure save;virtual;
      procedure load2;virtual;
    end;

    pRobot=^tRobot;
    tRobot=object(tTech)
      constructor Init(xx,yy,nwx,nwy,olx,oly,
      mvx,mvy,pow,pow1:integer;ras,sel,tt,ang:byte;
      sx,sy,st,tm2:integer;mov:boolean;ramx,ramy:integer;
      buil:pObject);
      constructor Init2;
      destructor Done;virtual;
      procedure show;virtual;
      procedure HandleEvent(var Event:tEvent);virtual;
      procedure Go;
      procedure CheckTarget;virtual;
      procedure save;virtual;
      procedure load2;virtual;
    end;

    pTank=^tTank;
    tTank=object(tRobot)
      constructor Init(xx,yy,nwx,nwy,olx,oly,
      mvx,mvy,pow,pow1:integer;ras,sel,tt,ang:byte;
      sx,sy,st,tm2:integer;mov:boolean;ramx,ramy:integer;dist,dam,ft:integer;
      defHouse:pObject;sWay:byte;pat:boolean);
      constructor Init2;
      destructor Done;virtual;
      procedure show;virtual;
      procedure HandleEvent(var Event:tEvent);virtual;
      procedure CheckTarget;virtual;
      procedure save;virtual;
      procedure load2;virtual;
    end;

    pAir=^tAir;
    tAir=object(tTech)
      goTime2:integer;
      KolStep:byte;
      timeToBomb:byte;
      flagBomb:boolean;
      constructor Init(xx,yy,nwx,nwy,olx,oly,
      mvx,mvy,pow,pow1:integer;ras,sel,tt,ang:byte;
      sx,sy,st,tm2:integer;mov:boolean;ramx,ramy:integer;
      dist,dam,ft:integer;defhouse:pObject;sWay:byte;pat:boolean);
      constructor Init2;
      destructor done; virtual;
      procedure handleEvent(var Event:tEvent);virtual;
      procedure Go;
      procedure show;virtual;
      procedure save;virtual;
      procedure load2;virtual;
    end;

    pHouse=^tHouse;
    tHouse=object(tObject)
      active:byte;
      lenx,leny:integer;
      num,numicons,ground,timebuild,timebuild2,tipbuild:integer;
      FlagWait:boolean;
      flagBuild:byte;{я строю}
      repairing:boolean;{я ремонтирую}
      kolTurret:array[70..71]of byte;
      kolDefen:array[0..1]of byte;
      remontTime:integer;
      flagfff:boolean;
      kolRefen:byte;
      timeSmoke,timeS:byte;
      constructor Init(xx,yy,lenxx,lenyy:integer;tt,r:byte;pow,pow1:integer);
      constructor Init2;
      destructor done;virtual;
      procedure HandleEvent(var Event:tEvent);virtual;
      procedure Show;virtual;
      procedure save;virtual;
      procedure load2;virtual;
    end;

implementation

procedure writexy(x,y,c:integer);
var s:string;
begin
  str(c,s);
  outtextxy(x,y,s);
end;

{***************************Tech*************************************}
procedure tTech.save;
begin
  inherited save;
  blockwrite(savefile,damage,sizeof(damage));
  blockwrite(savefile,target,sizeof(target));
  blockwrite(savefile,attack,sizeof(attack));
  blockwrite(savefile,tarx,sizeof(tarx));
  blockwrite(savefile,tary,sizeof(tary));
  blockwrite(savefile,pag,sizeof(pag));
  blockwrite(savefile,tiprocet,sizeof(tiprocet));
  blockwrite(savefile,angletime,sizeof(angletime));
  blockwrite(savefile,gruppa,sizeof(gruppa));
  blockwrite(savefile,sost,sizeof(sost));
  blockwrite(savefile,pousetime,sizeof(pousetime));
  blockwrite(savefile,sxx,sizeof(sxx));
  blockwrite(savefile,syy,sizeof(syy));
  blockwrite(savefile,builder,sizeof(builder));
  blockwrite(savefile,ktime,sizeof(ktime));
  blockwrite(savefile,flagk,sizeof(flagk));
  blockwrite(savefile,maxk,sizeof(maxk));
  blockwrite(savefile,flagsost,sizeof(flagsost));
  blockwrite(savefile,oldradar,sizeof(oldradar));
  blockwrite(savefile,oldnewx,sizeof(oldnewx));
  blockwrite(savefile,oldnewy,sizeof(oldnewy));
  blockwrite(savefile,defender,sizeof(defender));
  blockwrite(savefile,defenhouse,sizeof(defenhouse));
  blockwrite(savefile,sostway,sizeof(sostway));
  blockwrite(savefile,flagfff,sizeof(flagfff));
  blockwrite(savefile,remonttime,sizeof(remonttime));
  blockwrite(savefile,patr,sizeof(patr));
  blockwrite(savefile,timesmoke,sizeof(timesmoke));
  blockwrite(savefile,chrono,sizeof(chrono));
  blockwrite(savefile,chron,sizeof(chron));
  blockwrite(savefile,masload,sizeof(masload));
  blockwrite(savefile,masload2,sizeof(masload2));
end;

procedure tTech.load2;
begin
  inherited load2;
  blockread(loadfile,damage,sizeof(damage));
  blockread(loadfile,target,sizeof(target));
  blockread(loadfile,attack,sizeof(attack));
  blockread(loadfile,tarx,sizeof(tarx));
  blockread(loadfile,tary,sizeof(tary));
  blockread(loadfile,pag,sizeof(pag));
  blockread(loadfile,tiprocet,sizeof(tiprocet));
  blockread(loadfile,angletime,sizeof(angletime));
  blockread(loadfile,gruppa,sizeof(gruppa));
  blockread(loadfile,sost,sizeof(sost));
  blockread(loadfile,pousetime,sizeof(pousetime));
  blockread(loadfile,sxx,sizeof(sxx));
  blockread(loadfile,syy,sizeof(syy));
  blockread(loadfile,builder,sizeof(builder));
  blockread(loadfile,ktime,sizeof(ktime));
  blockread(loadfile,flagk,sizeof(flagk));
  blockread(loadfile,maxk,sizeof(maxk));
  blockread(loadfile,flagsost,sizeof(flagsost));
  blockread(loadfile,oldradar,sizeof(oldradar));
  blockread(loadfile,oldnewx,sizeof(oldnewx));
  blockread(loadfile,oldnewy,sizeof(oldnewy));
  blockread(loadfile,defender,sizeof(defender));
  blockread(loadfile,defenhouse,sizeof(defenhouse));
  blockread(loadfile,sostway,sizeof(sostway));
  blockread(loadfile,flagfff,sizeof(flagfff));
  blockread(loadfile,remonttime,sizeof(remonttime));
  blockread(loadfile,patr,sizeof(patr));
  blockread(loadfile,timesmoke,sizeof(timesmoke));
  blockread(loadfile,chrono,sizeof(chrono));
  blockread(loadfile,chron,sizeof(chron));
  blockread(loadfile,masload,sizeof(masload));
  blockread(loadfile,masload2,sizeof(masload2));
end;

procedure tTech.Group(xx:byte);
begin
end;

procedure tTech.HandleEvent(var Event:tEvent);
var event2:tEvent;
    f4,ff:boolean;
    i,j:integer;
    p:pObject;
begin
  ff:=false;
  if chron[2]=1
  then begin
    if chron[page]=1
    then chron[page]:=0
    else
      if (chron[1-page]=0)and not(pereris[0])and not(pereris[1])
      then begin
{        hidemouse;
        setactivepage(1-page);
        show;
        setactivepage(page);
        showmouse;}
        event2.watch:=cmevent;
        event2.code:=cmPal;
        event2.pow:=1;
        message(palet,event2);
        chron[2]:=0;
        flagChrono:=false;
      end;
  end;
  if event.watch=cmEvent then
  begin
    Case Event.code of
      cmRestore:begin
           if (repair<>nil)
           then begin
             f4:=nastroika(repair,myHouse);
           end;
           if (builder<>nil)
           then begin
             if race=1 then f4:=nastroika(builder,enemyHouse);
             if race=0 then
               f4:=nastroika(builder,myHouse);
           end;
           if target<>nil
           then begin
             if not attack then target:=nil
             else begin
               if race=1
               then begin
                 f4:=nastroika(target,myTank);
                 if not f4 then f4:=nastroika(target,viborTank);
                 if not f4 then f4:=nastroika(target,myAir);
                 if not f4 then f4:=nastroika(target,viborAir);
                 if not f4 then f4:=nastroika(target,myTurret);
                 if not f4 then f4:=nastroika(target,myHouse);
                 if not f4 then f4:=nastroika(target,myRobot);
                 if not f4 then f4:=nastroika(target,viborRobot);
               end;
               if race=0
               then begin
                 f4:=nastroika(target,enemyTank);
                 if not f4 then f4:=nastroika(target,enemyAir);
                 if not f4 then f4:=nastroika(target,enemyTurret);
                 if not f4 then f4:=nastroika(target,enemyHouse);
                 if not f4 then f4:=nastroika(target,enemyRobot);
               end;
             end;
           end;
           if defender
           then begin
             if race=1
             then begin
               f4:=nastroika(defenhouse,enemyHouse);
               if not f4 then defender:=false;
             end;
           end;
           if load[0]
           then begin
             f4:=nastroika(masLoad2[1],myTank);
             if not f4 then nastroika(masLoad2[1],myRobot);
           end;
           if kolLoad<>0
           then begin
             for i:=1 to kolLoad do
             begin
               f4:=nastroika(masLoad[i],myTank);
               if not f4 then nastroika(masLoad[i],myRobot);
             end;
           end;
         end;
      cmWhoIsIt:if IAm=event.komu
         then begin
           event.watch:=cmNothing;
           event.otkogo:=@self;
         end;
      cmYouDied:begin
                  died:=true;
                end;
      cmAllUnLoad:begin
                 if (tip in[35])and(kolLoad>0)and not(died)
                 then begin
                   event2.watch:=cmEvent;
                   event2.code:=cmUnLoad2;
                   j:=kolLoad;
                   for i:=1 to j do
                   begin
                     event2.x:=x;event2.y:=y;
                     event2.komu:=masload[i];
                     event2.mov:=false;
                     message(masload[i],event2);
                     if event2.mov then dec(kolLoad);
                   end;
                 end;
               end;
      cmOneUnLoad:begin
                 if (tip in[35])and(kolLoad>0)and not(died)
                 then begin
                   event2.watch:=cmEvent;
                   event2.code:=cmUnLoad2;
                   event2.x:=x;event2.y:=y;
                   event2.komu:=masload[kolLoad];
                   event2.mov:=false;
                   message(masload[KolLoad],event2);
                   if event2.mov then dec(kolLoad);
                 end;
               end;
      cmUnLoad2:if (event.komu=@self)
                then begin
                  ff:=false;
                  if (pole[event.x,event.y,0] in[0,3,4])
                  then begin
                    ff:=true;
                    x:=event.x;
                    y:=event.y;
                  end
                  else begin
                    for i:=event.x-1 to event.x+1 do
                      for j:=event.y-1 to event.y+1 do
                      begin
                        if (pole[i,j,0] in[0,3,4])
                        then begin
                          ff:=true;
                          x:=i;
                          y:=j;
                        end;
                      end;
                  end;
                  if ff
                  then begin
                    newx:=x;
                    newy:=y;
                    pole[x,y,0]:=tip;
                    load[1]:=false;
                    event.mov:=true;
                    pereris[0]:=true;
                    pereris[1]:=true;
                  end;
                end;
      cmLoad2:if(gr=0)and(race=0)and(event.komu=@self)
              then begin
                if moving
                then begin
                  moving:=false;
                  newx:=x;newy:=y;
                end;
                sost:=3;
                pole[x,y,0]:=0;
                pole[oldx,oldy,0]:=0;
                load[1]:=true;
                event.otkogo:=@self;

                if (chrono)and(select=1)
                and(chronoCur)
                then chronoCur:=false;

                if select=1
                then begin
                  event2.watch:=cmEvent;
                  event2.code:=cmInsertToVibor;
                  event2.otkogo:=@self;
                  event2.tip:=tip;
                  message(mytank,event2);
                end;

                event2.watch:=cmEvent;
                Event2.code:=cmIAmDied;
                Event2.otkogo:=@self;
                if (race=0)
                then begin
                  message(enemytank,event2);
                  message(enemyRobot,event2);
                  message(enemyair,event2);
                  message(enemyTurret,event2);
                end;
                if (race=1)
                then begin
                 message(vibortank,event2);
                 message(mytank,event2);
                 message(myRobot,event2);
                 message(viborRobot,event2);
                 message(viborair,event2);
                 message(myair,event2);
                 message(myTurret,event2);
                end;
                message(rocet,event2);
                message(deleting,event2);

                setwsize(0,0,640,480);
                putpixel(radarx+oldx,radary+oldy,diedcolor);
                putpixel(radarx+x,radary+y,diedcolor);
                setactivepage(1-page);
                putpixel(radarx+oldx,radary+oldy,diedcolor);
                putpixel(radarx+x,radary+y,diedcolor);
                setactivepage(page);
                setwsize(0,0,520,480);
                pereris[0]:=true;
                pereris[1]:=true;
              end;
      cmLoad:if(race=0)and(gr=0)
             and(x=event.x)and(event.y=y)
             then begin
               event.otkogo:=@self;
             end;
      cmChrono:if not died
               then begin
                 flagradar[0]:=true;
                 flagradar[1]:=true;
                 putpixel(radarx+x,radary+y,diedcolor);
                 setactivepage(1-page);
                 putpixel(radarx+x,radary+y,diedcolor);
                 setactivepage(page);
                 pole[oldx,oldy,0]:=0;
                 pole[x,y,0]:=0;
                 x:=event.x;
                 y:=event.y;
                 oldx:=x;oldy:=y;
                 newx:=x;newy:=y;
                 pole[x,y,0]:=tip;
                 attack:=false;
                 target:=nil;
                 pereris[0]:=true;
                 pereris[1]:=true;
                 chronoCur:=false;
                 energy:=0;
                 event2.watch:=cmEvent;
                 Event2.code:=cmIAmDied;
                 Event2.otkogo:=@self;
                 if (race=0)
                 then begin
                   message(enemytank,event2);
                   message(enemyRobot,event2);
                   message(enemyair,event2);
                   message(enemyTurret,event2);
                 end;
                 if (race=1)
                 then begin
                  message(vibortank,event2);
                  message(mytank,event2);
                  message(viborair,event2);
                  message(myair,event2);
                  message(myTurret,event2);
                 end;
                 message(rocet,event2);
                 message(deleting,event2);
                 flagChrono:=true;
                 chron[0]:=1;
                 chron[1]:=1;
                 chron[2]:=1;
                 event2.watch:=cmevent;
                 event2.code:=cmPal;
                 event2.pow:=0;
                 message(palet,event2);
               end;
      cmFire:begin
               if (cloack)or(chrono)
               then begin
                 if TimeInc>0 then dec(timeInc)
                 else begin
                   TimeInc:=time12;
                   if (flagCloack)
                   then begin
                     if energy>0 then dec(energy)
                     else flagCloack:=false;
                   end
                   else if energy<energy1
                        then inc(energy);
                 end;
               end;
               if (flagSmoke=1)and not(load[1])
               then begin
                 if timeSmoke>0 then dec(timeSmoke)
                 else begin
                   TimeSmoke:=time9;
                   event2.watch:=cmEvent;
                   event2.code:=cmSmoke;
                   event2.pow:=1;
                   event2.tm2:=time8;
                   event2.tip:=tip;
                   event2.ang:=angle;
                   event2.mvx:=gr;  {под/над деревьями}
                   event2.mvy:=0;  {тип дыма}
                   event2.x:=x*40+movex*step+((sizex) div 2)+sprx-ramkax;
                   event2.y:=movey*step+y*40+((sizey) div 2)-kkk+spry-ramkay;
                   if tip in[35]
                   then begin
                     event2.x:=event2.x+5;
                     event2.y:=event2.y-5;
                   end;
                   if tip in[24..25,65..66]
                   then begin
                     event2.x:=event2.x-5;
                     event2.y:=event2.y-8;
                   end;
                   if tip in[27]
                   then begin
                     event2.x:=event2.x-5;
                     event2.y:=event2.y-9;
                   end;
                   if tip in[29]
                   then begin
                     event2.x:=event2.x-6;
                     event2.y:=event2.y-9;
                   end;
                   message(desk,event2);
                 end;
               end;
             end;
      cmAttack3:if(sostWay<>255)and not(patr)and(race=1)
                then begin
{                  if (event.ground=tipAttack)or(tipAttack=2) then
                  begin
                    attack:=true;
                    tiptar:=event.ground;
                    target:=Event.komu;
                    tarx:=Event.komu^.x*40;
                    tary:=event.komu^.y*40;
                    if(step<>0)and(rasst(x*40,y*40,tarx,tary)>distance) then
                    begin
                      newx:=Event.komu^.x;
                      newy:=event.komu^.y;
                      moving:=true;
                      sost:=3;
                      sostWay:=100;
                    end;
                  end
                  else begin}
                    newx:=Event.komu^.x;
                    newy:=event.komu^.y;
                    moving:=true;
                    sost:=3;
                    sostWay:=100;
{                  end;}
                end;
      cmAttack4:if(sostWay<>255)and not(patr)and(race=1)
                then begin
{                  if (event.ground=tipAttack)or(tipAttack=2) then
                  begin
                    attack:=true;
                    tiptar:=event.ground;
                    target:=Event.komu;
                    tarx:=Event.komu^.x*40;
                    tary:=event.komu^.y*40;
                    if(step<>0)and(rasst(x*40,y*40,tarx,tary)>distance) then
                    begin
                      newx:=Event.komu^.x;
                      newy:=event.komu^.y;
                      moving:=true;
                      sost:=3;
                      sostWay:=100;
                    end;
                  end
                  else begin}
                    newx:=Event.x;
                    newy:=event.y;
                    moving:=true;
                    sost:=3;
                    sostWay:=100;
{                  end;}
                end;
      cmFreeHarv:begin
                   if(race=1)and(tip in[66])and(builder=nil)
                   then begin
                     inc(event.pow);
                     builder:=event.otkogo;
                     sost:=2;
                   end;
                 end;
      cmUnBuilder:begin
                    if (tip in[66])and(builder=event.otkogo)
                    then begin
                      builder:=nil;
                      sost:=3;
                    end;
                  end;
      cmNewGo2:if(not(sostWay in[255,100,99])and not(patr))or((tip=67)and not(notiberium))
               and not(tip in[65,66])
               then begin
                 newx:=event.newx;
                 newy:=event.newy;
                 sostWay:=255;
                 if tip=67
                 then begin
                   newx:=newx+2;
                   newy:=newy+5;
                   if not(pole3[newx,newy,0] in[0,3,4])
                   then begin
                     if not(pole[newx,newy,0] in[0,3,4])
                     then pole[newx,newy,0]:=0;
                     pole3[newx,newy,0]:=0;
                   end;
                 end;
               end;
      cmUnDefen:begin
                  if (defender)or(step=0)
                  then begin
                    defender:=false;
                    defenHouse:=nil;
                    if step<>0 then sostWay:=0;
                  end;
                end;
      cmAttack2:if(race=1)and(step<>0)and(event.otkogo=defenHouse)
                then begin
                  if (event.ground=tipAttack)or(tipAttack=2) then
                  begin
                    attack:=true;
                    tiptar:=event.ground;
                    target:=Event.komu;
                    tarx:=Event.komu^.x*40;
                    tary:=event.komu^.y*40;
                    if(step<>0)and(rasst(x*40,y*40,tarx,tary)>distance) then
                    begin
                      newx:=Event.komu^.x;
                      newy:=event.komu^.y;
                      moving:=true;
                      sost:=3;
                    end;
                  end
{                  else begin
                    newx:=Event.komu^.x;
                    newy:=event.komu^.y;
                    moving:=true;
                    sost:=3;
                  end;}
                end;
      cmIAmDied:begin
               if (tip in[35])and(Load[0])
               then begin
                 if masload2[1]=event.otkogo
                 then begin
                   load[0]:=false;
                   newx:=x;newy:=y;
                 end;
               end;
               if event.otkogo=defenHouse then defenHouse:=nil;
               if (attack)and(Event.otkogo=target)then begin
                 attack:=false;
                 target:=nil;
                 if (moving=true)and(step<>0) then begin
                   newx:=x+round(movex/10);newy:=y+round(movey/10);
                   flagac[0]:=2;
                   pag:=page;
                 end;
                 if (race=1)and(defenHouse<>nil)and(step<>0)
                 then begin
                   newx:=pHouse(defenHouse)^.x;
                   newy:=pHouse(defenHouse)^.y;
                 end;
                 if not(sostWay in[255,100])and(race=1)
                 and not(tip in[65,66]){and(patr)}
                 then begin
                   inc(sostWay);
                   if sostway>4 then sostWay:=0;
                   moving:=true;
                 end;
                 if (sostWay in[100])and(race=1)
                 then begin
                   sostWay:=100;
                   event2.watch:=cmevent;
                   event2.code:=cmGetKoord;
                   message(desk,event2);
                   newx:=event2.x;
                   newy:=event2.y;
                 end;
                 exit;
               end;
             end;
      cmCloack:begin
                 if (cloack)and((energy>25)or(flagCloack))
                 then begin
                   flagradar[0]:=true;
                   flagradar[1]:=true;
                   if not flagCloack then Energy:=energy-25;
                   flagcloack:=not flagcloack;
                   if flagcloack
                   then begin
                     event2.watch:=cmEvent;
                     event2.code:=cmUnAttack;
                     event2.otkogo:=@self;
                     if race=0
                     then begin
                       message(enemytank,event2);
                       message(enemyair,event2);
                       message(enemyturret,event2);
                     end;
                     if race=1
                     then begin
                       message(mytank,event2);
                       message(myair,event2);
                       message(vibortank,event2);
                       message(viborair,event2);
                       message(myturret,event2);
                     end;
                   end;
                 end;
               end;
      cmUnAttack:if(event.otkogo=target)
                 then begin
                   attack:=false;
                   target:=nil;
                 end;
      cmUnRepair:begin
                   repair:=nil;
                   if (gr=0)
                   then begin
                     newy:=y+1;
                     sost:=3;
                     repair:=nil;
                   end;
                   if (sost=11)and(gr=1)
                   then begin
                     repair:=nil;
                     flagsost:=true;
                     flagk:=2;
                     newy:=y+1;
                   end;
                 end;
      cmIncPower:begin
                   if(repair=event.otkogo)and(repair<>nil)and
                   ((sost in[11])and(((gr=1)and(kkk=0))or(gr=0))
                   or((sost=10)and(gr=0)and(x=newx)and(y=newy)))and(power<power1)
                   then begin
                     inc(power);

                     if (power/power1)<=1/3 then flagSmoke:=1
                     else flagSmoke:=0;

                   end;
                   if(repair=event.otkogo)and(repair<>nil)and(sost in[10,11])
                   then
                     event.code:=cmItIsWho;
                   if (power=power1)and((gr=0))
                   then begin
                     newy:=y+1;
                     sost:=3;
                     repair:=nil;
                   end;
                   if (power=power1)and((sost=11)and(gr=1))
                   then begin
                     flagsost:=true;
                     flagk:=2;
                     newy:=y+1;
                     repair:=nil;
                   end;
                 end;
      cmGroup:begin
                gruppa[event.tip]:=true;
              end;
      cmUnGroup:begin
                gruppa[event.tip]:=false;
              end;
      cmToGroup:if (gruppa[event.tip])and(not died)
                then begin
                  select:=0;
                  event2.watch:=cmEvent;
                  event2.code:=cmInsertToVibor;
                  event2.otkogo:=@self;
                  event2.tip:=tip;
                  message(owner,event2);
                end;
      cmRadar:if(not moving)and(event.x=x)and(event.y=y)
              {and(x=newx)and(y=newy)}and(gr=1)then
              begin
                flagradar[0]:=true;
                flagradar[1]:=true;
              end;
      cmGetXY:begin
                if(Event.komu=@self)then
                begin
                  Event.x:=x;Event.y:=y;
                  event.ground:=gr;
                  event.mov:=false;
                  if flagcloack
                  then begin
                    event2.watch:=cmEvent;
                    event2.code:=cmIAmCloack;
                    event2.x:=x;
                    event2.y:=y;
                    event2.mov:=true;
                    if race=0
                    then begin
                      message(enemytank,event2);
                      message(enemyair,event2);
                      message(enemyturret,event2);
                    end;
                    if race=1
                    then begin
                      message(mytank,event2);
                      message(myair,event2);
                      message(vibortank,event2);
                      message(viborair,event2);
                      message(myturret,event2);
                    end;
                    event.mov:=event2.mov;
                  end;
                  exit;
                end;
              end;
      cmIAmCloack:if detector
                  then begin
                    if rasst(x*40,y*40,event.x*40,event.y*40)<=distance
                    then begin
                      event.mov:=false;
                      event.code:=cmItIsWho;
                    end;
                  end;
      cmWho:if(angle<>25)and not(load[1])
            and(not died)and(itisi(Event.x,event.y)){and(race=0)}then
            begin
              if (chrono)and(select=1)and(energy=energy1)
              then begin
                oldCursor:=cursor;
                cursor:=5;
                setcursor(cursor);
                ChronoCur:=true;
              end;
              if not desk^.remont
              then begin
                event2.mov:=false;
                if (race=1)and(flagcloack)
                then begin
                  event2.watch:=cmEvent;
                  event2.code:=cmIAmCloack;
                  event2.x:=x;
                  event2.y:=y;
                  event2.mov:=true;
                  message(mytank,event2);
                  message(myRobot,event2);
                  message(myair,event2);
                  message(vibortank,event2);
                  message(viborair,event2);
                  message(viborRobot,event2);
                  message(myturret,event2);
                end;
                if not event2.mov
                then begin
                  Event.watch:=cmEvent;
                  Event.otkogo:=@self;
                  Event.tip:=tip;
                  Event.ground:=gr;
                  Event.code:=cmItIsWho;
                end;
              end
              else begin
                remont:=not(remont);
              end;
            end;
      cmWho2:if (not died)and not(load[1])
            and(x=Event.x)and(y=Event.y)and(race=event.ras)then
            begin
              if flagcloack
              then begin
                event2.watch:=cmEvent;
                event2.code:=cmIAmCloack;
                event2.x:=x;
                event2.y:=y;
                event2.mov:=true;
                if race=0
                then begin
                  message(enemytank,event2);
                  message(enemyair,event2);
                  message(enemyturret,event2);
                  message(enemyRobot,event2);
                end;
                if race=1
                then begin
                  message(mytank,event2);
                  message(myRobot,event2);
                  message(viborRobot,event2);
                  message(myair,event2);
                  message(vibortank,event2);
                  message(viborair,event2);
                  message(myturret,event2);
                end;
              end;
              if (not flagcloack)or(event.pow=111)or(not event2.mov)
              then begin
                Event.watch:=cmEvent;
                Event.otkogo:=@self;
                Event.tip:=tip;
                Event.code:=cmItIsWho;
              end
            end;
      cmNewGo:if (step<>0)and not((sost=2)and(pousetime<>pouse)) then
              begin
                if event.newx<=520 then
                begin
                  load[0]:=false;
                  oldnewx:=newx;
                  oldnewy:=newy;
                  newx:=(Event.newx div 40)+polex;
                  newy:=(Event.newy div 40)+poley;
                  if not(sost in[10,11])then sost:=3;

                  if (select=1)and(tip in[35])and(kolLoad<maxLoad)
                  and(pole[newx,newy,0]in [23..29])
                  and(viborAir^.elem=viborAir^.last)
                  then begin
                    load[0]:=true;
                    event2.watch:=cmEvent;
                    event2.code:=cmLoad;
                    event2.x:=newx;
                    event2.y:=newy;
                    event2.otkogo:=@self;
                    message(MyTank,event2);
                    message(MyRobot,event2);
                    masload2[1]:=event2.otkogo;
                    newx:=event2.x;newy:=event2.y;
                    moving:=true;
                  end;
                  if (tip in[24..25])and((pole[newx,newy,gr] in[112])or(pole[newx,newy,gr]=200))
                  then begin
                    event2.x:=newx;event2.y:=newy;
                    event2.watch:=cmEvent;
                    event2.code:=cmWho2;
                    event2.ras:=race;
                    event2.pow:=0;
                    message(myhouse,event2);
                    if event2.code=cmItIsWho then
                    begin
                      newx:=event2.newx;
                      newy:=event2.newy;
                      sxx:=event2.sx;
                      syy:=event2.sy;
                      case event2.tip of
{                        111:begin
                              repair:=nil;
                              sost:=1;
                            end;}
                        112:begin
                             repair:=nil;
                             sost:=2;
                             builder:=event2.otkogo;
                           end;
                      end;
                    end;
                  end;
                  if ((pole[newx,newy,0] in[116])or(pole[newx,newy,0]=205))
{                  and(power<power1)}
                  then begin
                    if power<power1
                    then begin
                      if(sost<>10)and(sost<>11)
                      then begin
                        event2.x:=newx;event2.y:=newy;
                        event2.watch:=cmEvent;
                        event2.code:=cmWho2;
                        event2.pow:=111;
                        event2.ras:=race;
                        event2.otkogo:=@self;
                        message(myhouse,event2);
                      end
                      else begin
                        ff:=true;
                        newx:=oldnewx;newy:=oldnewy;
                      end;
                      if (event2.code=cmItIsWho)
                      then begin
                        ff:=true;
                        newx:=oldnewx;newy:=oldnewy;
                      end;
                      if (event2.code=cmItIsWho)and(event2.pow=123)
                      then begin
                        newx:=event2.newx+1;
                        newy:=event2.newy;
                        repair:=event2.otkogo;
                        attack:=false;
                        target:=nil;
                        sost:=10;
                      end;
                    end
                    else begin
                      ff:=true;
                      newx:=oldnewx;newy:=oldnewy;
                    end;
                  end;
                  if (sost in [10,11])and(not ff)
                  then begin
                    repair:=nil;
                    flagsost:=true;
                    flagk:=2;
                    if sost=10 then sost:=3;
                  end;
                end
                else begin
                  if (event.newx>radarx)and(event.newx<radarx+maxx)and
                  (event.newy>radary)and(event.newy<radary+maxy)
                  then begin
                    newx:=event.newx-radarx;
                    newy:=event.newy-radary;
                    if not(sost in[10,11])then sost:=3;
                    if sost in[10,11] then
                    begin
                      flagsost:=true;
                      repair:=nil;
                      flagk:=2;
                      if (owner=mytank)or(owner=vibortank)
                      then
                        sost:=3;
                    end;
                  end;
                end;
                if not flaggo then begin
                  flaggo:=true;
                  moving:=true;
                end;
                target:=nil;
                attack:=false;
              end;

    end;
  end;
end;

constructor tTech.init;
begin
  inherited init;
  if tip in[27]
  then chrono:=true
  else chrono:=false;
end;

constructor tTech.init2;
begin
  inherited init2;
end;

destructor tTech.done;
begin
  inherited done;
end;

procedure tTech.show;
begin
  inherited show;
end;

{***************************Air*************************************}
procedure tAir.save;
begin
  inherited save;
  blockwrite(savefile,gotime2,sizeof(gotime2));
  blockwrite(savefile,kolstep,sizeof(kolstep));
  blockwrite(savefile,timetobomb,sizeof(timetobomb));
  blockwrite(savefile,flagbomb,sizeof(flagbomb));
end;

procedure tAir.load2;
begin
  inherited load2;
  blockread(loadfile,gotime2,sizeof(gotime2));
  blockread(loadfile,kolstep,sizeof(kolstep));
  blockread(loadfile,timetobomb,sizeof(timetobomb));
  blockread(loadfile,flagbomb,sizeof(flagbomb));
end;

procedure tAir.HandleEvent(var Event:tEvent);
var i1,j1,i,j:integer;
    tar:tTarget;
    Event2:tEvent;
    fNew:boolean;
    p:pointer;
begin
  pole2[x,y-1]:=1;
  pole2[x,y]:=1;
  if (moving)or(died)or(tip in[31,77,35]) then modifpole2(x,y,tip);
  if (race=1)and(flagcloack)
  then begin
    event2.mov:=false;
    if (race=1)and(flagcloack)
    then begin
      event2.watch:=cmEvent;
      event2.code:=cmIAmCloack;
      event2.x:=x;
      event2.y:=y;
      event2.mov:=true;
      message(mytank,event2);
      message(myair,event2);
      message(vibortank,event2);
      message(viborair,event2);
      message(myturret,event2);
    end;
    if oldradar<>event2.mov
    then begin
      oldradar:=event2.mov;
      flagradar[0]:=true;
      flagradar[1]:=true;
    end;
  end;

  if (event.watch=cmEvent)and(event.code=cmFire)
  and(flagradar[page]) then
  begin
    flagradar[page]:=false;
    setwsize(0,0,640,480);
    if died then
      case pole[x,y,0] of
        0,3,4:putpixel(radarx+x,radary+y,diedcolor);
        2,5,6,12:putpixel(radarx+x,radary+y,103);
        11,8,9,1,7,233:putpixel(radarx+x,radary+y,59);
        10,255,254:putpixel(radarx+x,radary+y,moneycolor);
        50..80,121..130,201,206:putpixel(radarx+x,radary+y,enemycolor);
        23..29,100..119,200,205:putpixel(radarx+x,radary+y,mycolor);
      end;
    case pole[oldx,oldy,0] of
      0,3,4:putpixel(radarx+oldx,radary+oldy,diedcolor);
      2,5,6,12:putpixel(radarx+oldx,radary+oldy,103);
      11,8,12,9,1,7,233:putpixel(radarx+oldx,radary+oldy,59);
      10,254,255:putpixel(radarx+oldx,radary+oldy,moneycolor);
{      60..67,}70..71,121..130,201,206:putpixel(radarx+oldx,radary+oldy,enemycolor);
{      23..29,}100..119,200,205:putpixel(radarx+oldx,radary+oldy,mycolor);
    end;
    if (race=1)and(pole[oldx,oldy,0] in[23..29,40..41])
    then putpixel(radarx+oldx,radary+oldy,mycolor);
    if (race=0)and(pole[oldx,oldy,0] in[60..67,70..71])
    then putpixel(radarx+oldx,radary+oldy,enemycolor);
    event2.mov:=false;
    if (flagcloack)and(race=1)
    then begin
      event2.watch:=cmEvent;
      event2.code:=cmIAmCloack;
      event2.x:=x;
      event2.y:=y;
      event2.mov:=true;
      message(mytank,event2);
      message(myair,event2);
      message(vibortank,event2);
      message(viborair,event2);
      message(myturret,event2);
    end;
    if event2.mov then select:=0;
    if not(died)and not(event2.mov)
    then putpixel(radarx+x,radary+y,color);
    setwsize(0,0,520,480);
  end;
  if flagac[0]<>0 then  begin
    if flagac[0]=2 then modifpole2(x,y,tip);
    if flagac[0]=1 then pole2[x,y-1]:=1;
    if pag<>page then
      flagac[0]:=0;
  end;
  if (pole[x,y,1]=0)and not(died) then pole[x,y,1]:=tip;

  if (x=newx)and(y=newy)and not(moving)and(sost=10)and(maxk<>kkkk)
  then begin
    maxk:=kkkk;
    kkk:=kkkk;
    flagk:=1;
    sost:=11;
{    event2.x:=newx;event2.y:=newy;
    event2.watch:=cmEvent;
    event2.code:=cmWho2;
    event2.ras:=race;
    event2.pow:=111;
    event2.otkogo:=@self;
    message(repair,event2);}
  end;
  if (event.watch=cmevent)and(event.code=cmFire)and
  ((flagk<>0)and not(attack)and(x=newx)and(y=newy)and not(moving)
  or(sost=11)) then
  begin
    if ktime>0 then dec(ktime)
    else begin
      if (kkk=oldk)and(flagsost)
      then begin
        sost:=3;
        maxk:=1;
        flagsost:=false;
      end;
      kTime:=kkktime;
      if tip in[31,77] then ktime:=kkktime2;
      if (sost=11) then
        ktime:=kkktime3;
      if flagk=1 then
      begin
        if (kkk>oldk-maxk) then dec(kkk)
        else begin
          if (sost<>11) then flagk:=2;
{          inc(kkk);}
        end;
      end;
      if flagk=2 then
      begin
        if (kkk<oldk+maxk) then inc(kkk)
        else
        begin
          flagk:=1;
          dec(kkk);
        end;
      end;
    end;
  end;
  if ((x<>newx)or(y<>newy))and(not moving)and(not flaggo2)then
  begin
    moving:=true;
    flaggo2:=true;
  end;
  if (died)and(event.watch=cmEvent)and(event.code=cmFire) then
  begin
    if phase=0 then begin
      flagcloack:=false;
      if (defenHouse<>nil)
      then begin
        if step<>0
        then begin
          event2.watch:=cmEvent;
          event2.code:=cmDecDefen;
          event2.pow:=gr;
          message(defenHouse,event2);
        end;
        defenHouse:=nil;
      end;
      if repair<>nil
      then begin
        event2.watch:=cmEvent;
        event2.code:=cmUnRepair;
        message(repair,event2);
        repair:=nil;
      end;
      pole[x,y,1]:=0;
      pole[oldx,oldy,1]:=0;
      if (movex>0)and(movey=0) then
        pole[x+1,y,1]:=0;
      if (movey>0)and(movex=0) then
        pole[x,y+1,1]:=0;
      if (movex<0)and(movey=0) then
        pole[x-1,y,1]:=0;
      if (movey<0)and(movex=0) then
        pole[x,y-1,1]:=0;
      if (movex<0)and(movey<0) then
        pole[x-1,y-1,1]:=0;
      if (movex>0)and(movey>0) then
        pole[x+1,y+1,1]:=0;
      if (movex<0)and(movey>0) then
        pole[x-1,y+1,1]:=0;
      if (movex>0)and(movey<0) then
        pole[x+1,y-1,1]:=0;
      select:=0;
{      step:=0;}
    end;
    if timephase>0 then dec(timephase)
    else begin
      timephase:=1;
      modifpole2(x,y,tip);
      if phase<=maxphase then begin
{        tip:=45;}
        angle:=phase;
      end
      else angle:=25;
      if phase=maxphase+2 then
      begin
        event2.watch:=cmEvent;
        Event2.otkogo:=@self;
        event2.code:=cmDel;
        message(owner,event2);
        event2.watch:=cmNothing;
      end;
      inc(phase);
    end;
{    exit;}
  end;

  if event.watch=cmEvent then
  begin
    Case Event.code of
{      cmGo:if (sost<>11)and(moving)and(step<>0)and(not died) then
             go;}
      cmUnselect:begin
                   if select=1 then begin
                     select:=0;
                     modifpole2(x,y,tip);
                     fff:=true;
                     flagac[0]:=2;
                     pag:=page;
                   end;
                 end;
      cmAttack:begin
                 if (event.ground=tipAttack)or(tipAttack=2) then
                 begin
                   event2.watch:=cmEvent;
                   Event2.code:=cmGetXY;
                   event2.komu:=event.otkogo;
                   event2.mov:=false;
                   message(event.otkogo,event2);
                   if not event2.mov
                   then begin
                     attack:=true;
                     tiptar:=event.ground;
                     target:=event.otkogo;
                     tarx:=event2.x*40;
                     tary:=event2.y*40;
                     if rasst(x*40,y*40,Event.otkogo^.x*40,event.otkogo^.y*40)>distance
                     then
                     begin
                       newx:=Event.otkogo^.x;
                       newy:=event.otkogo^.y;
                       moving:=true;
                     end;
                   end;
                 end
                 else begin
                   newx:=Event.otkogo^.x;
                   newy:=event.otkogo^.y;
                   moving:=true;
                 end;
               end;
      cmDecPower:begin
                   if (event.tip=1)and(Event.komu=@self)and(not died)
                   then begin
                     fnew:=false;
                     if (((x=newx)and(y=newy))or((sostWay<>255)and(race=1))
                     and((attack=false)or(sostway=100)))
                     then fnew:=true;
                     if (attack)and(target<>nil)and(not fnew)and
                     (step=0)
                     then begin
                       event2.watch:=cmEvent;
                       event2.code:=cmGetxy;
                       Event2.komu:=target;
                       message(target,event2);
                       if(not event2.mov)and(rasst(x*40,y*40,Event2.x*40,event2.y*40)>distance)
                       then
                         fnew:=true;
                     end;
                     if fnew then
                     begin
                       if ((event.otkogo^.gr=tipattack)or(tipattack=2))
                       and(event.otkogo<>nil)and(not event.otkogo^.flagcloack)
                       and(not attack)
                       then
                       begin
                         target:=Event.otkogo;
                         attack:=true;
                         tiptar:=event.otkogo^.gr;
                         tarx:=Event.otkogo^.x*40;
                         tary:=Event.otkogo^.y*40;
                         if (rasst(x*40,y*40,Event.otkogo^.x*40,event.otkogo^.y*40)>distance)
                         then begin
{                           if sostway in[100]
                           then begin
                             sostway:=99;
                             oldnewx2:=newx;
                             oldnewy2:=newy;
                           end;}
                           newx:=Event.otkogo^.x;
                           newy:=event.otkogo^.y;
                           moving:=true;
                         end;
                       end;
{                       else begin
                         readkey;
                       end;}
                     end;
                     if power-Event.pow>0
                     then begin
                       power:=power-Event.pow;

                       if (power/power1)<=1/3 then flagSmoke:=1
                       else flagSmoke:=0;

                       if (race=1)and(cloack)and(energy>25)
                       then begin
                         event2.watch:=cmEvent;
                         event2.code:=cmIAmCloack;
                         event2.x:=x;
                         event2.y:=y;
                         event2.mov:=true;
                         message(mytank,event2);
                         message(myair,event2);
                         message(vibortank,event2);
                         message(viborair,event2);
                         message(myturret,event2);
                         flagcloack:=true;
                         if event2.mov then
                           select:=0;
                       end;
                       flagradar[0]:=true;
                       flagradar[1]:=true;
                     end
                     else begin

                       if flagplay>250
                       then flagplay:=250;

                       if (race=1)and(step<>0)
                       then begin
                         if defenHouse<>nil then inc(kolAir);
                         if patr
                         then begin
                           patrol[1]:=true;
                           inc(kolPatrol[1]);
                         end;
                       end;
                       Event2.watch:=cmevent;
                       Event2.code:=cmIAmDied;
{                       Event.komu:=@self;}
                       Event2.otkogo:=@self;
                       if (race=0)
                       then begin
                         message(enemytank,event2);
                         message(enemyair,event2);
                         message(enemyturret,event2);
                       end;
                       if (race=1)
                       then begin
                        message(vibortank,event2);
                        message(mytank,event2);
                        message(viborair,event2);
                        message(myair,event2);
                        message(myturret,event2);
                       end;
                       message(rocet,event2);
                       message(deleting,event2);
                       if kolLoad>0
                       then begin
                         event2.watch:=cmEvent;
                         event2.code:=cmYouDied;
                         for i:=1 to kolLoad do
                         begin
                           event2.komu:=masload[i];
                           message(masload[i],event2);
                         end;
                       end;
                       flagradar[0]:=true;
                       flagradar[1]:=true;
                       attack:=false;
                       died:=true;
                       oldtip:=tip;
                       if (tip=31)or(tip=77) then begin
                         tip:=46;
                         maxphase:=8;
                       end
                       else begin
                         tip:=47;
                         maxphase:=11;
                       end;
{                       event2.watch:=cmEvent;
                       Event2.otkogo:=@self;
                       event2.code:=cmDel;
                       message(owner,event2);
                       Event.watch:=cmNothing;}
                       exit;
                     end;
                     Event.watch:=cmNothing;
                   end;
                 end;
      cmFire:begin
{               if (tip in[36])and(not died)
               then begin
                 if timetoBomb>0
                 then dec(timeToBomb)
                 else begin
                   timeToBomb:=time13;
                   case angle of
                     0,4:begin
                          pgroup(rocet2)^.insert(new(pRocet2,init((x)*40+20+movex*step,movey*step-kkk+(y-1)*40,7)));
                          pgroup(rocet2)^.insert(new(pRocet2,init((x)*40+20+movex*step,movey*step-kkk+(y)*40,7)));
                          pgroup(rocet2)^.insert(new(pRocet2,init((x)*40+20+movex*step,movey*step-kkk+(y+1)*40,7)));
                         end;
                     2,6:begin
                          pgroup(rocet2)^.insert(new(pRocet2,init((x-1)*40+20+movex*step,movey*step-kkk+(y)*40,7)));
                          pgroup(rocet2)^.insert(new(pRocet2,init((x)*40+20+movex*step,movey*step-kkk+(y)*40,7)));
                          pgroup(rocet2)^.insert(new(pRocet2,init((x+1)*40+20+movex*step,movey*step-kkk+(y)*40,7)));
                         end;
                     1,5:begin
                          pgroup(rocet2)^.insert(new(pRocet2,init((x-1)*40+20+movex*step,movey*step-kkk+(y-1)*40,7)));
                          pgroup(rocet2)^.insert(new(pRocet2,init((x)*40+20+movex*step,movey*step-kkk+(y)*40,7)));
                          pgroup(rocet2)^.insert(new(pRocet2,init((x+1)*40+20+movex*step,movey*step-kkk+(y+1)*40,7)));
                         end;
                     3,7:begin
                          pgroup(rocet2)^.insert(new(pRocet2,init((x-1)*40+20+movex*step,movey*step-kkk+(y+1)*40,7)));
                          pgroup(rocet2)^.insert(new(pRocet2,init((x)*40+20+movex*step,movey*step-kkk+(y)*40,7)));
                          pgroup(rocet2)^.insert(new(pRocet2,init((x+1)*40+20+movex*step,movey*step-kkk+(y-1)*40,7)));
                         end;
                   end;
                 end;
               end;}
               if (sost<>11)and(moving)and(step<>0)and(not died)
               then go;
               if (not died)and(owner<>deleting) then
               begin
(*                 if(((x=newx)and(y=newy))or((movex=0)and(movey=0)
                 and((sostWay<>255)and(race=1))and(race=1)))
                 and((not attack){or(sostWay=100)})
                 then*)
                 if (((x=newx)and(y=newy)and(movex=0)and(movey=0))
                 and(not Attack))
                 or((sostWay<>255)and
                 ((not attack)or((attack)and(rasst(x*40,y*40,tarx,tary)>distance))))
                 then
                 begin
                   p:=seektarget(x,y,distance);
                   if p<>nil then begin
                     moving:=false;
{                     if sostWay in[100]
                     then begin
                       moving:=true;
                       oldnewx2:=newx;oldnewy2:=newy;
                     end;}
                     newx:=x;newy:=y;
{                     aa:=tip;}
                     event2.watch:=cmEvent;
                     event2.code:=cmGetxy;
                     event2.komu:=p;
                     message(p,event2);
                     attack:=true;
                     target:=p;
                     tiptar:=event2.ground;
                     tarx:=Event2.x*40;
                     tary:=Event2.y*40;
                   end;
                 end;

                 if firetime>0 then dec(firetime);
                 if ((not moving)or((sostway<>255)and(race=1)))and(target<>nil)and(attack) then begin
                   if rasst(x*40,y*40,tarx,tary)>distance then
                   begin
                     event2.watch:=cmEvent;
                     event2.code:=cmGetXY;
                     event2.komu:=target;
                     message(target,event2);
                     if not event2.mov
                     then begin
                       newx:=event2.x;newy:=event2.y;
                     end
                     else begin
                            target:=nil;
                            attack:=false;
                            newx:=x;newy:=y;
                          end;
                     moving:=true;
                   end;
                 end;
                 if (attack)and(target<>nil)then
                 begin
                   event2.watch:=cmEvent;
                   Event2.code:=cmGetXY;
                   event2.komu:=target;
                   message(target,event2);
                   if not event2.mov
                   then begin
                     tarx:=event2.x*40+10;
                     tary:=event2.y*40+10;
                   end
                   else begin
                          target:=nil;
                          attack:=false;
                          newx:=x;newy:=y;
                        end;
                 end;
                 if (attack)and(moving) then begin
                   if rasst(x*40,y*40,tarx,tary)<=distance then begin
                     newx:=x;newy:=y;{moving:=false;}
                   end
                   else begin
                     event2.watch:=cmEvent;
                     event2.code:=cmGetXY;
                     event2.komu:=target;
                     message(target,event2);
                     if not event2.mov
                     then begin
                       newx:=event2.x;newy:=event2.y;
                     end
                     else begin
                            target:=nil;
                            attack:=false;
                            newx:=x;newy:=y;
                          end;
                   end;
                 end;
                 if (target<>nil)and(firetime=0)and(attack=true)
                 and(rasst(x*40,y*40,tarx,tary)<=distance) then begin
                   firetime:=time3;
                   tar.watch:=cmKoord;
                   tar.x:=tarx;tar.y:=tary;
                   if (not moving)or(step=0)or((sostWay<>255)and(race=1)) then
                   angle:=ang(x,y,tarx div 40,tary div 40);

                   if (tip in[31,77])and(flagplay>600)
                   then flagplay:=600;
                   if (tip in[33,79])and(flagplay>650)
                   then flagplay:=650;
                   if not(tip in[31,77])and(flagplay>700)
                   then flagplay:=700;

                   case angle of
                     0:pgroup(rocet)^.insert(new(pRocet,init(x*40+sizex+sprx,spry-kkk+y*40+(sizey div 2),0,0,5,5,
                     tar,damage,target,@self,tiprocet,tiptar)));
                     4:pgroup(rocet)^.insert(new(pRocet,init(x*40+sprx,spry-kkk+y*40+(sizey div 2),0,0,5,5,
                     tar,damage,target,@self,tiprocet,tiptar)));
                     2:pgroup(rocet)^.insert(new(pRocet,init(x*40+(sizex div 2)+sprx,spry-kkk+y*40,0,0,5,5,
                     tar,damage,target,@self,tiprocet,tiptar)));
                     6:pgroup(rocet)^.insert(new(pRocet,init(x*40+(sizex div 2)+sprx,spry-kkk+y*40+sizey,0,0,5,5,
                     tar,damage,target,@self,tiprocet,tiptar)));
                     1:pgroup(rocet)^.insert(new(pRocet,init(x*40+sizex+sprx,spry-kkk+y*40,0,0,5,5,
                     tar,damage,target,@self,tiprocet,tiptar)));
                     3:pgroup(rocet)^.insert(new(pRocet,init(x*40+sprx,spry-kkk+y*40,0,0,5,5,
                     tar,damage,target,@self,tiprocet,tiptar)));
                     5:pgroup(rocet)^.insert(new(pRocet,init(x*40+sprx,spry-kkk+y*40+sizey,0,0,5,5,
                     tar,damage,target,@self,tiprocet,tiptar)));
                     7:pgroup(rocet)^.insert(new(pRocet,init(x*40+sizex+sprx,spry-kkk+y*40+sizey,0,0,5,5,
                     tar,damage,target,@self,tiprocet,tiptar)));
                   end;
                 end;

               end;
             end
    end;
  end;
  inherited handleevent(event);
end;

procedure tAir.Go;
var ff,xx,yy,fx,fy:byte;{0-влево,вниз ,1-вправо,вверх}
    i,j,num:integer;
    event2:tEvent;
    f:boolean;

  function aaa:integer;
  var n:integer;
  begin
    if (dx=1)and(dy=0) then n:=0;
    if (dx=1)and(dy=-1) then n:=1;
    if (dx=0)and(dy=-1) then n:=2;
    if (dx=-1)and(dy=-1) then n:=3;
    if (dx=-1)and(dy=0) then n:=4;
    if (dx=-1)and(dy=1) then n:=5;
    if (dx=0)and(dy=1) then n:=6;
    if (dx=1)and(dy=1) then n:=7;
    aaa:=n;
  end;

  procedure bbb(num:integer);
  begin
    case num of
      0:begin dx:=1;dy:=0;end;
      1:begin dx:=1;dy:=-1;end;
      2:begin dx:=0;dy:=-1;end;
      3:begin dx:=-1;dy:=-1;end;
      4:begin dx:=-1;dy:=0;end;
      5:begin dx:=-1;dy:=1;end;
      6:begin dx:=0;dy:=1;end;
      7:begin dx:=1;dy:=1;end;
    end;
  end;

  procedure selectgo;
  var n:integer;
  begin
    dx:=0;dy:=0;
    if (newx>x) then begin
      dx:=1;
    end;
    if (newx<x) then begin
      dx:=-1
    end;
    if (newy>y) then begin
      dy:=1;
    end;
    if (newy<y) then begin
      dy:=-1
    end;

    if (pole[x+dx,y+dy,1]<>0){and((sost<>10)and(sost<>11))}then
    begin
      num:=aaa;
      n:=0;
      repeat
        inc(num);inc(n);
        if num=8 then num:=0;
        bbb(num);
        if (x+dx>maxx)or(y+dy>maxy)
        or(y+dy<0)or(x+dx<0) then begin
          dx:=0;dy:=0;
        end;
      until (pole[x+dx,y+dy,1]=0)or(n=8);
      if (n=8)and(pole[x+dx,y+dy,1]<>0) then begin
        dx:=0;dy:=0;
      end;
    end;
  end;

begin
  if (newx<0)or(newx>maxx)or(newy<0)or(newy>maxy)
  then begin
    newx:=x;
    newy:=y;
    sound(100);
    delay(100);
    nosound;
  end;
  if (pole[newx,newy,1]<>0)and(sost<>10)and(sost<>11)
  and not((x=newx)and(y=newy))and(dx=0)and(dy=0)and(not attack)
  then begin
    f:=false;
{      newx:=x+(movex div (40 div step));newy:=y+(movey div(40 div step));}
    xx:=newx;yy:=newy;
    for i:=xx-1 to xx+1 do
      for j:=yy+1 downto yy-1 do
        if (i>0)and(j>0)and(i<maxx)and(j<maxy)then
        begin
          if pole[i,j,1]=0 then
          begin
            newx:=i;newy:=j;f:=true;
          end;
        end;
    if not f then begin
      newx:=x+(movex div (40 div step));newy:=y+(movey div(40 div step));
    end;
  end;

  if (x=newx)and(y=newy)and(movex=0)and(movey=0)
  then begin
    if load[0]
    then begin
      load[0]:=false;
      event2.watch:=cmEvent;
      event2.code:=cmLoad2;
      event2.komu:=masload2[1];
      message(myTank,event2);
      message(viborTank,event2);
      message(myRobot,event2);
      message(viborRobot,event2);
      inc(kolLoad);
      masLoad[kolLoad]:=masLoad2[1];
      flagRadar[0]:=true;
      flagRadar[1]:=true;
    end;
    if not flag then pole[oldx,oldy,1]:=0;
    oldx:=x;oldy:=y;
    gotime2:=time7;
    kolStep:=kolSt;
    if (sostWay in[255,100,99])or(race=0)
    then moving:=false
    else
      if (not attack)and(race=1)
      then begin
        newx:=Way[sostway,0];
        newy:=Way[sostway,1];
        inc(sostWay);
        if SostWay>4 then sostway:=0;
      end;
    flag:=false;
    fff:=false;
{    modifpole2(x,y,tip);}
    exit;
  end;
  fff:=true;
{  modifpole2(x,y,tip);}
  if kolStep>0
  then dec(kolStep);
  if GoTime>0
  then dec(GoTime)
  else
  begin
    fx:=2;fy:=2;ff:=0;
    if GoTime2>Time2
    then begin
      GoTime:=goTime2;
      if kolStep=0
      then begin
        dec(GoTime2);
        kolStep:=kolSt;
      end;
    end
    else GoTime:=Time2;

    if (movex=0)and(movey=0)then begin
      if ((not flag)and(x<>oldx)or(y<>oldy)){and((x>0)and(y>0)and(x<maxx)and(y<maxy))}then
        pole[oldx,oldy,1]:=0;
        selectgo;
{      if (dx<>0)and(dy<>0) then begin}
        pole[x+dx,y+dy,1]:={pole[x+dx,y+dy]+}tip;
        oldx:=x;oldy:=y;
{      end;}
    end;
    if (dx=1) then begin
      fx:=1;
      if movex<20/step-1 then inc(movex) else begin
        oldx:=x;ff:=1;
        inc(x);dx:=0;
                       flagradar[0]:=true;
                       flagradar[1]:=true;

        movex:=-20 div step;
      end;
    end;
    if (dx=-1) then begin
      fx:=0;
      if movex>-20/step+1 then dec(movex) else begin
        oldx:=x;ff:=1;
        dec(x);dx:=0;
                       flagradar[0]:=true;
                       flagradar[1]:=true;

        movex:=20 div step;
      end;
    end;
    if (dy=1) then begin
      fy:=0;
      if movey<20/step-1 then inc(movey) else begin
        oldy:=y;ff:=1;
        inc(y);dy:=0;
                       flagradar[0]:=true;
                       flagradar[1]:=true;

        movey:=-20 div step;
      end;
    end;
    if (dy=-1) then begin
      fy:=1;
      if movey>-20/step+1 then dec(movey) else begin
        oldy:=y;ff:=1;
        dec(y);dy:=0;
                       flagradar[0]:=true;
                       flagradar[1]:=true;

        movey:=20 div step;
      end;
    end;
    if (dx=0) and (dy=0) then
    begin
      if movey>0 then begin
        dec(movey);
      end;
      if movey<0 then begin
        inc(movey);
      end;
      if movex>0 then begin
        dec(movex);
      end;
      if movex<0 then begin
        inc(movex);
      end;
    end;
    if (fx=0) then angle:=4;
    if (fx=1) then angle:=0;
    if (fy=0) then angle:=6;
    if (fy=1) then angle:=2;
    if (fx=0)and(fy=0) then angle:=5;
    if (fx=0)and(fy=1) then angle:=3;
    if (fx=1)and(fy=0) then angle:=7;
    if (fx=1)and(fy=1) then angle:=1;
  end;
  if (load[0])
  then begin
    event2.watch:=cmEvent;
    event2.code:=cmGetXY;
    event2.komu:=masLoad2[1];
    message(masLoad2[1],event2);
    newx:=event2.x;
    newy:=event2.y;
    moving:=true;
  end;

{  putsprite(0,0,dirt[0]);
  putsprite(30,0,dirt[0]);
  putsprite(60,0,dirt[0]);
  setcolor(0);
  str(x,st);
  outtextxy(0,0,st);
  str(y,st);
  outtextxy(15,0,st);
  str(newx,st);
  outtextxy(0,15,st);
  str(newy,st);
  outtextxy(15,15,st);}
end;

procedure tAir.show;
begin
  inherited show;
end;

constructor tAir.init2;
begin
  inherited init2;
end;

constructor tAir.init(xx,yy,nwx,nwy,olx,oly,mvx,mvy,
                      pow,pow1:integer;ras,sel,tt,ang:byte;
                     sx,sy,st,tm2:integer;mov:boolean;ramx,ramy:integer;
                     dist,dam,ft:integer;defhouse:pObject;sWay:byte;pat:boolean);
begin
  inherited init;
  x:=xx;y:=yy;newx:=nwx;newy:=nwy;
  oldx:=olx;oldy:=oly;
  oldnewx:=newx;oldnewy:=newy;
  tip:=tt;angle:=ang;
  pole[x,y,1]:=tip;
  power1:=pow1;power:=pow;
  sizex:=sx;sizey:=sy;
  movex:=0;movey:=0;moving:=false;
  step:=st;time2:=tm2;
  gotime:=tm2;
  gotime2:=time7;
  kolStep:=kolSt;
  select:=sel;race:=ras;
  moving:=mov;
  flag:=false;
  ramkax:=ramx;ramkay:=ramy;
  attack:=false;
  damage:=dam;
  distance:=dist;
  time3:=ft;
  firetime:=time3;
  died:=false;
  phase:=0;
  maxphase:=0;
  timephase:=0;
  sprx:=0;spry:=0;
  kkk:=kkkk;
  oldk:=kkkk;
  maxk:=1;
  flagk:=1;
  flagsost:=false;
  ktime:=kkktime;
  if race=0 then color:=mycolor else color:=enemycolor;
  flagradar[0]:=true;
  flagradar[1]:=true;
  tipattack:=1;
  tiprocet:=2;
  gr:=1;
  cloack:=false;
  flagcloack:=false;
  detector:=false;
  flagBomb:=false;
  if tip in[30,32,76,78]
  then begin
    ramkax:=4;
    ramkay:=4;
  end;
  if tip in[31,33,77,79]
  then begin
    ramkax:=2;
    ramkay:=2;
  end;
  if (tip in[31,77])
  then begin
    sizex:=75;
    sizey:=75;
    sprx:=-19;spry:=-20;
    tipattack:=2;
    tiprocet:=1;
    step:=1;
  end;
  if (tip=32)or(tip=78)
  then begin
    step:=3;
  end;
  if tip in[33,79]
  then begin
    cloack:=true;
    tipattack:=2;
    sizex:=36;sizey:=35;
    step:=2;
{    detector:=true;}
  end;
  if tip in[34,80]
  then begin
    tipattack:=3;
    sizex:=37;sizey:=36;
    detector:=true;
  end;
  if (tip=35)
  then begin
    tipattack:=3;
    sizex:=65;
    sizey:=65;
    sprx:=-19;spry:=-20;
    ramkax:=8;
    ramkay:=5;
  end;
  if tip in[36]
  then begin
    sizex:=39;
    sizey:=39;
    timeToBomb:=0;
{    flagBomb:=true;}
  end;
  fillchar(gruppa,sizeOF(gruppa),false);
  sost:=3;
  repair:=nil;
  defenhouse:=defhouse;
  if defenhouse<>nil
  then defender:=true
  else defender:=false;
  sostWay:=255;
  if race=0 then sostway:=5;
  remont:=false;
  remontTime:=0;
  sostWay:=sWay;
  if (sostWay<>255)and(race=1) then moving:=true;
  patr:=pat;
  timeSmoke:=0;
  if (power/power1)<=1/3 then flagSmoke:=1
  else flagSmoke:=0;

  energy:=0;energy1:=0;
  if tip in[33,79]
  then begin
    energy:=100;energy1:=200;
  end;
  TimeInc:=time12;
  load[0]:=false;
  load[1]:=false;
  kolLoad:=0;
  chron[1]:=0;
  chron[2]:=0;
end;

destructor tAir.done;
begin
{  pole[x,y,1]:=0;
  if movex>0 then
    pole[x+1,y,1]:=0;
  if movey>0 then
    pole[x,y+1,1]:=0;
  if movex<0 then
    pole[x-1,y,1]:=0;
  if movey<0 then
    pole[x,y-1,1]:=0;}

  inherited done;
end;

{***************************House*************************************}
procedure tHouse.save;
begin
  inherited save;
  blockwrite(savefile,active,sizeof(active));
  blockwrite(savefile,lenx,sizeof(lenx));
  blockwrite(savefile,leny,sizeof(leny));
  blockwrite(savefile,num,sizeof(num));
  blockwrite(savefile,numicons,sizeof(numicons));
  blockwrite(savefile,ground,sizeof(ground));
  blockwrite(savefile,timebuild,sizeof(timebuild));
  blockwrite(savefile,timebuild2,sizeof(timebuild2));
  blockwrite(savefile,tipbuild,sizeof(tipbuild));
  blockwrite(savefile,flagwait,sizeof(flagwait));
  blockwrite(savefile,flagbuild,sizeof(flagbuild));
  blockwrite(savefile,repairing,sizeof(repairing));
  blockwrite(savefile,kolturret,sizeof(kolturret));
  blockwrite(savefile,koldefen,sizeof(koldefen));
  blockwrite(savefile,remonttime,sizeof(remonttime));
  blockwrite(savefile,flagfff,sizeof(flagfff));
  blockwrite(savefile,kolrefen,sizeof(kolrefen));
  blockwrite(savefile,timesmoke,sizeof(timesmoke));
  blockwrite(savefile,times,sizeof(times));
  blockwrite(savefile,power,sizeof(power));
  blockwrite(savefile,power1,sizeof(power1));
end;

procedure tHouse.load2;
begin
{  kkk:=1;
  x:=1;
  y:=1;
  sizex:=1;
  sizey:=1;
  ramkax:=1;
  ramkay:=1;}

  inherited load2;
{  sizex:=1;
  sizey:=1;
  kkk:=1;
  ramkax:=1;
  ramkay:=1;}
  blockread(loadfile,active,sizeof(active));
  blockread(loadfile,lenx,sizeof(lenx));
  blockread(loadfile,leny,sizeof(leny));
  blockread(loadfile,num,sizeof(num));
  blockread(loadfile,numicons,sizeof(numicons));
  blockread(loadfile,ground,sizeof(ground));
  blockread(loadfile,timebuild,sizeof(timebuild));
  blockread(loadfile,timebuild2,sizeof(timebuild2));
  blockread(loadfile,tipbuild,sizeof(tipbuild));
  blockread(loadfile,flagwait,sizeof(flagwait));
  blockread(loadfile,flagbuild,sizeof(flagbuild));
  blockread(loadfile,repairing,sizeof(repairing));
  blockread(loadfile,kolturret,sizeof(kolturret));
  blockread(loadfile,koldefen,sizeof(koldefen));
  blockread(loadfile,remonttime,sizeof(remonttime));
  blockread(loadfile,flagfff,sizeof(flagfff));
  blockread(loadfile,kolrefen,sizeof(kolrefen));
  blockread(loadfile,timesmoke,sizeof(timesmoke));
  blockread(loadfile,times,sizeof(times));
  blockread(loadfile,power,sizeof(power));
  blockread(loadfile,power1,sizeof(power1));

  kkk:=0;
end;

destructor tHouse.done;
var event2:tEvent;
begin
  if(race=1)and(oldtip=121)
  then begin
    event2.watch:=cmEvent;
    event2.code:=cmGetTip121;
    event2.tip:=121;
    event2.ras:=1;
    event2.mov:=false;
    event2.otkogo:=@self;
    message(enemyhouse,event2);
    if not event2.mov
    then Construction:=false;
  end;
  if oldtip=112
  then noTiberium:=false;
  if (race=0)
  then begin
    event2.watch:=cmEvent;
    event2.code:=cmGetTip121;
    event2.tip:=oldtip;
    event2.ras:=0;
    event2.mov:=false;
    message(myhouse,event2);
    if not event2.mov
    then begin
    case oldtip of
      112:begin{рефин}
            masMyFlagBuild[114]:=false;
            masMyFlagBuild[117]:=false;
            masMyFlagBuild[118]:=false;
            newpanel[0]:=true;
            newpanel[1]:=true;
          end;
      113:begin{самол завод}
{            newpanel[0]:=true;
            newpanel[1]:=true;}
          end;
      115:begin{электр}
            masMyFlagBuild[112]:=false;
            newpanel[0]:=true;
            newpanel[1]:=true;
          end;
      114:begin{танк завод}
            masMyFlagBuild[113]:=false;
            masMyFlagBuild[116]:=false;
            newpanel[0]:=true;
            newpanel[1]:=true;
          end;
      end;
    end;
  end;
  inherited done;
end;

constructor tHouse.init2;
begin
  inherited init2;
end;

constructor tHouse.init(xx,yy,lenxx,lenyy:integer;tt,r:byte;pow,pow1:integer);
var i,j:integer;
    event2:tEvent;
begin
  ramkax:=0;ramkay:=0;
  angle:=0;
  power:=pow;power1:=pow1;
  movex:=0;movey:=0;
  race:=r;
  x:=xx;y:=yy;
  oldtip:=tt;
  tip:=tt;
  sizey:=lenyy*40;sizex:=lenxx*40-20;
  if (tip<>112) then sizex:=sizex+20;
  if tip in[112,122] then sizey:=sizey+10;
  sprx:=10;spry:=0;
  lenx:=lenxx;leny:=lenyy;
  if tip=121 then
    construction:=true;
  if tip=112 then maxnumber[0]:=maxnumber[0]+3;
  if tip=122 then maxnumber[1]:=maxnumber[1]+3;
  if tip=125 then maxenerge[1]:=maxenerge[1]+6;
  if tip=115 then maxenerge[0]:=maxenerge[0]+3;
  movex:=0;movey:=0;
  select:=0;active:=0;
  step:=0;
  for i:=0 to lenxx-1 do
    for j:=0 to lenyy-1 do
    begin
      pole[i+x,j+y,0]:=200+race;
      pole3[i+x,j+y,0]:=200+race;
      if tip in[116,126]
      then begin
        pole[i+x,j+y,0]:=200+race+5;
        pole3[i+x,j+y,0]:=200+race+5;
      end;
    end;
  pole[x,y,0]:=tip;
  pole3[x,y,0]:=tip;
  flagbuild:=0;
  timebuild:=0;
  timebuild2:=0;
  flagwait:=false;
  num:=0;
{  number:=0;}
  kkk:=0;
  died:=false;
  phase:=0;
  maxphase:=0;
  timephase:=0;
  if race=0
  then color:=mycolor
  else color:=enemycolor;
  flagradar[0]:=true;
  flagradar[1]:=true;
  gr:=0;
  repairing:=false;
  timerepair:=0;
  repair:=nil;
  remont:=false;
  remontTime:=0;
  flagfff:=false;
  if race=1
  then begin
    kolTank:=kolTank+maxDefen[0];
    kolAir:=kolAir+maxDefen[1];
    fillchar(kolTurret,sizeOF(KolTurret),0);
    fillchar(kolDefen,sizeOF(KolDefen),0);
  end;
  event2.pow:=0;
  if (tip in[122])
  then begin
    event2.watch:=cmEvent;
    event2.code:=cmFreeHarv;
    event2.otkogo:=@self;
{    message(enemyTank,event2);}
    message(enemyRobot,event2);
  end;
  kolRefen:=0+event2.pow;
  number[1]:=number[1]+event2.pow;
  case tip of
    112:begin{рефин}
          masMyFlagBuild[114]:=true;
          masMyFlagBuild[117]:=true;
          masMyFlagBuild[118]:=true;
        end;
    113:begin{самол завод}
        end;
    115:begin{электр}
          masMyFlagBuild[112]:=true;
        end;
    114:begin{танк завод}
          masMyFlagBuild[113]:=true;
          masMyFlagBuild[116]:=true;
        end;
  end;
  TimeSmoke:=0;
  if (power/power1)<=1/3 then flagSmoke:=1
  else flagSmoke:=0;
  kolLOad:=0;
end;

procedure tHouse.handleEvent(var Event:tEvent);
var len,n,m,i1,j1,i,j:integer;
    f4,fff,ff,f:boolean;
    Event2:tEvent;
    fnew:boolean;
begin
  if select=1 then
    modifpole((x-polex+1)*40,(y-poley)*40,(x+lenx-polex-1)*40,(y-poley)*40);
  if (event.watch=cmevent)and(event.code=cmFire)
  and(flagradar[page]) then
  begin
    flagradar[page]:=false;
    setwsize(0,0,640,480);
    if not died then setcolor(color)
    else setcolor(diedcolor);
    bar(radarx+x,radary+y,radarx+x+lenx-1,radary+y+leny-1);
    if (died)and(oldtip in[112,122])then
    begin
      setcolor(moneycolor);
      bar(radarx+x,radary+y,radarx+x+2,radary+y+1);
    end;
    setwsize(0,0,520,480);
  end;

  if (flagac[0]=5)and(event.code=cmFire)and(event.watch=cmEvent) then
  begin
    newpanel[0]:=true;
    newpanel[1]:=true;
    inc(kol);
    if kol>2 then flagac[0]:=0;
  end;

  if (died)and(event.watch=cmEvent)and(event.code=cmFire) then
  begin
    if phase=0 then begin
      if (race=1)and(not flagfff)
      then begin
        if oldtip<>111
        then begin
          dec(numberbuild[oldtip]);
          flagNewBuild:=true;
        end;
        flagfff:=true;
        event2.watch:=cmEvent;
        event2.code:=cmUnDefen;
        message(enemyTank,event2);
        message(enemyRobot,event2);
        message(enemyAir,event2);
        message(enemyTurret,event2);
      end;
      if (repairing)and(repair<>nil)
      then begin
        event2.watch:=cmEvent;
        event2.code:=cmUnRepair;
        message(repair,event2);
        repair:=nil;
      end;
      for i:=0 to lenx-1 do
        for j:=0 to leny-1 do
        begin
          pole[i+x,j+y,0]:=0;
          pole3[i+x,j+y,0]:=0;
        end;
      if oldtip in[112,122]then
      begin
        for i:=x to x+2 do
          for j:=y to y+1 do
          begin
            pole[i,j,0]:=255;
            pole3[i,j,0]:=255;
          end;
        pole[x,y,0]:=10;
        pole[x+2,y+1,0]:=254;
        pole3[x,y,0]:=10;
        pole3[x+2,y+1,0]:=254;
      end;
      if sel=@self then sel:=nil;
      if selhouse=@self then selhouse:=nil;
      select:=0;
      step:=0;
    end;
    if timephase>0 then dec(timephase)
    else begin
      modifpole2(x+1,y+1,31);
      if phase<=maxphase then begin
        angle:=phase;
        timephase:=0;
      end
      else begin
        angle:=25;
        timephase:=0;
      end;
      if phase=maxphase+2 then
      begin
        event.watch:=cmEvent;
        Event.otkogo:=@self;
        event.code:=cmDel;
        message(owner,event);
        event.watch:=cmNothing;
      end;
      inc(phase);
    end;
{    exit;}
  end;

  if (sel<>@self)and(select=1)and(not flagloadfile)
  then
  begin
    select:=0;
    pereris[0]:=true;
    pereris[1]:=true;
    newpanel[0]:=true;
    newpanel[1]:=true;
  end;
  if (selhouse<>@self)and(active=1)and(not flagloadfile)
  then begin
    active:=0;
  end;
  if Event.watch=cmEvent then
  begin
    case event.code of
      cmRestore:begin
           if (repairing)and(repair<>nil)
           then begin
             f4:=nastroika(repair,mytank);
             if not f4 then nastroika(repair,myAir);
             if not f4 then nastroika(repair,vibortank);
             if not f4 then nastroika(repair,viborair);
           end;
         end;
      cmWhoIsIt:if IAm=event.komu
         then begin
           event.watch:=cmNothing;
           event.otkogo:=@self;
         end;
      cmFire:begin
             if flagSmoke=1
             then begin
               if timeSmoke>0 then dec(timeSmoke)
               else begin
                 TimeSmoke:=time11;
                 event2.watch:=cmEvent;
                 event2.code:=cmSmoke;
                 event2.pow:=2;
                 event2.tm2:=3;
                 event2.tip:=tip;
                 event2.ang:=0;
                 event2.sx:=sizex;
                 event2.sy:=sizey;
                 event2.x:=x*40;
                 event2.y:=y*40;
                 event2.mvx:=gr;  {под/над деревьями}
                 event2.mvy:=0;  {тип дыма}
                 message(desk,event2);
               end;
             end;
             if (tip=122)and(flagBuild=0)and(not died)and(kolRefen<3)
             and(number[1]<maxnumber[1])
             then begin
               inc(number[1]);
               inc(kolRefen);
               flagBuild:=buildTech;
               Flagwait:=false;
               timebuild:=mastimebuild[66];
               timebuild2:=timebuild;
               tipbuild:=66;
               ground:=0;
             end;
             if(race=1)and(power<(power1 div 3)*2)
             then remont:=true;
             if (remont)
             then begin
               if remontTime>0
               then dec(remontTime)
               else begin
                 movex:=1-movex;
                 if power<power1
                 then begin
                   inc(power);
                   remontTime:=time6;

                   if (power/power1)<=1/3 then flagSmoke:=1
                   else flagSmoke:=0;

                 end
                 else remont:=false;
               end;
             end;
             if (repairing)and(repair<>nil)
             then begin
               if timerepair>0 then dec(timerepair)
               else
               begin
                 angle:=1-angle;
                 timerepair:=time5;
                 event2.watch:=cmEvent;
                 event2.code:=cmIncPower;
                 event2.otkogo:=@self;
                 message(repair,event2);
                 if event2.code<>cmItIsWho
                 then begin
                   angle:=0;
                   repairing:=false;
                   repair:=nil;
                 end;
               end;
             end;
           end;
      cmGetTip121:if (tip=Event.tip)and(race=event.ras)and(not died)
                  and(event.otkogo<>@self)
                  then event.mov:=true;
      cmGetTip:if event.komu=@self
               then begin
                 event.tip:=tip;
                 event.code:=cmItIsWho;
                 event.x:=flagBuild;  {0-не строю}
               end;
      cmNewDefen:if (race=1)and(event.pow<>2)
                 then begin
                   if kolDefen[event.pow]<maxDefen[Event.pow]
                   then begin
                     event.otkogo:=@self;
                     event.x:=x;
                     event.y:=y;
                     inc(koldefen[Event.pow]);
                     event.pow:=2;
                   end;
              end;
      cmDecDefen:dec(kolDefen[event.pow]);
      cmDecTurret:begin
                    dec(kolTurret[event.tip]);
                  end;
      cmTurret:if (race=1)and(not died)
               then begin
                 if (kolTurret[70]<maxTurret[70]){and(tip<>125)}and(not died)
                 then begin
                   event.tip:=70;
                   event.otkogo:=@self;
                 end;
                 if (kolTurret[71]<maxTurret[71]){and(tip<>125)}and(not died)
                 then begin
                   event.tip:=71;
                   event.otkogo:=@self;
                 end;
               end;
      cmPutTurret:begin
                    for i:=x-2 to x+2 do
                      for j:=y-2 to y+2 do
                        if (i>0)and(j>0)and(i<maxx)and(j<maxy)
                        and(pole[i,j,0]=0)then begin
                          pgroup(enemyturret)^.insert(new(pTank,init(i,j,i,j,i,j,0,0,
                          300,300,1,0,event.tip,4,40,40,0,100,false,0,0,240+80,50,30,@self,255,false)));
                          inc(kolTurret[event.tip]);
                          exit;
                        end;
                  end;
      cmUnRepair:begin
                   repairing:=false;
                   repair:=nil;
                   if not died then angle:=0;
                 end;
      cmGetNum:if (event.komu=@self)and(not died) then
               begin
                 event.tip:=tip;
                 event.x:=num;
                 event.code:=cmItIsWho;
               end;
      cmdecNumber:begin
                     if(Event.komu=@self) then
                     dec(number[race]);
                     if race=1
                     then dec(kolrefen);
                   end;
      cmGetXY:if(Event.komu=@self)then
              begin
                event.mov:=false;
                Event.x:=x+lenx div 2;
                Event.y:=y+leny div 2;
                event.ground:=0;
                exit;
              end;
      cmWho:if (not died)and(ItIsI(Event.x,Event.y)){and(race=0)}then
            begin
              Event.watch:=cmEvent;
              Event.otkogo:=@self;
              Event.tip:=tip;
              event.ground:=0;
              Event.code:=cmItIsWho;
            end;
      cmWho2:if (not died)and(race=Event.ras)and
             (x<=Event.x)and(y<=Event.y)and(x+lenx>event.x)and(y+leny>event.y)
             then
             begin
               if(event.pow=111)
               then
                 if (tip=116)and(not repairing)
                 then begin
                   event.pow:=123;
                   repairing:=true;
                   repair:=event.otkogo;
                 end
                 else event.mov:=false;
               Event.mov:=false;
               Event.watch:=cmEvent;
               Event.otkogo:=@self;
               Event.tip:=tip;
               event.sx:=lenx;event.sy:=leny;
               event.newx:=x;event.newy:=y;
               Event.code:=cmItIsWho;
             end;
      cmWho3:begin
               if(event.tip=tip)and not(died)
               then
               begin
                 if (event.pow<>cmItIsWho)or
                 ((Event.pow=cmItIsWho)and
                 (rasst(event.oldx,event.oldy,x,y)<rasst(event.oldx,event.oldy,event.x,event.y)))
                 then begin
                   event.pow:=cmItIsWho;
                   event.x:=x;event.y:=y;
                   event.sx:=lenx;event.sy:=leny;
                 end
               end;
             end;
      cmWho4:begin
               if(event.komu=@self)then
               begin
                 event.code:=cmItIsWho;
                 event.x:=x;event.y:=y;
                 event.sx:=lenx;event.sy:=leny;
               end;
             end;
      cmNoPutBuild:begin
                      flagbuild:=buildHouse;
                      timebuild:=0;
                      newpanel[0]:=true;
                      newpanel[1]:=true;
                    end;
      cmPutBuild:begin
                   flagbuild:=0;
                   num:=0;
                   flagac[0]:=5;
                   kol:=0;
                   newpanel[0]:=true;
                   newpanel[1]:=true;
                 end;
      cmDecPower:begin
                   if (Event.komu=@self)and(not died) then begin
                     if power-Event.pow>0
                     then begin
                       power:=power-Event.pow;
                       if (race=1)and(event.otkogo<>nil)
                       then begin
                         event2.watch:=cmEvent;
                         event2.code:=cmAttack2;
                         event2.komu:=event.otkogo;
                         event2.ground:=event.otkogo^.gr;
                         event2.otkogo:=@self;
                         message(enemyTank,event2);
                         message(enemyAir,event2);
                       end;
                     end
                     else begin

                       if flagplay>200
                       then flagplay:=200;

                       Event2.watch:=cmEvent;
                       Event2.code:=cmIAmDied;
{                       Event.komu:=@self;}
                       Event2.otkogo:=@self;
                       if race=0
                       then begin
                         message(enemytank,event2);
                         message(enemyair,event2);
                       end;
                       if race=1
                       then begin
                        message(vibortank,event2);
                        message(mytank,event2);
                        message(viborair,event2);
                        message(myair,event2);
                       end;
                       message(myturret,event2);
                       message(enemyturret,event2);
                       message(rocet,event2);
                       message(deleting,event2);

                       flagradar[0]:=true;
                       flagradar[1]:=true;
                       died:=true;
                       oldtip:=tip;
                       tip:=130;
                       if (oldtip=112)and(maxnumber[0]>=3)
                       then maxnumber[0]:=maxnumber[0]-3;
                       if (oldtip=122)and(maxnumber[1]>=3)
                       then maxnumber[1]:=maxnumber[1]-3;
                       if (oldtip=125)and(maxenerge[1]>=6)
                       then maxenerge[1]:=maxenerge[1]-6;
                       if (oldtip=115)and(maxenerge[0]>=3)
                       then maxenerge[0]:=maxenerge[0]-3;
                       if (race=1)and(oldtip=122)
                       then begin
                         event2.watch:=cmEvent;
                         event2.code:=cmUnBuilder;
                         event2.otkogo:=@self;
                         message(enemytank,event2);
                       end;
                       phase:=0;
                       maxphase:=11;
                       if select=1 then
                       begin
                         select:=0;
                         pereris[0]:=true;
                         pereris[1]:=true;
                       end;
                       if selhouse=@self then
                       begin
                         for i:=0 to maxicon do
                           masflagicon[i]:=false;
                         newpanel[0]:=true;
                         newpanel[1]:=true;
                         num:=0;
                         message(desk,event2);
                       end;
{                       event2.watch:=cmEvent;
                       Event2.otkogo:=@self;
                       event2.code:=cmDel;
                       message(owner,event2);
                       Event.watch:=cmNothing;}
                       exit;
                     end;
                     Event.watch:=cmNothing;
                   end;
                 end;

    end;
  end;
{**начало постройки**}
  if ((flagbuild<>0)or(flagwait)) then begin
    if ((timebuild>=0)and(event.code=cmFire)
    and(event.watch=cmEvent)) then
    begin
      if selhouse=@self then
      begin
        setwsize(0,0,640,480);
        button(0,27,false);
        len:=size2-round(timebuild/timebuild2*(size2));
        hidemouse;
        putsprite(xxx2+2,yyy2+3,masicon[numicons]);
        showmouse;
        rectangle(xxx2+4,yyy2+32,xxx2+6+size2,yyy2+35+3,0,15);
        setcolor(green);
        bar(xxx2+5,yyy2+33,xxx2+5+len,yyy2+35+2);
        setwsize(0,0,520,480);
      end;
    end;
  end;
  if (flagbuild<>0) then begin
    if ((timebuild>=0)and(event.code=cmFire)
    and(event.watch=cmEvent)) then
    begin
      if timebuild>0 then dec(timebuild);
    end;
    if (selhouse=@self){and(timebuild=0)}and(flagbuild<>0) then
    begin
{      if timebuild>0 then button(num,27,true)
      else button(num,27,false);}
      build:=true;
    end;
    if (timebuild=0)and(flagbuild=buildTech) then
    begin
      flagbuild:=0;
      Event2.watch:=cmEvent;
      f:=false;
      for i:=x-1 to x+lenx do
        for j:=y-1 to y+leny do
          if (i>=0)and(j>=0)and(i<=maxx)and(j<=maxy) then
          begin
            if (pole[i,j,ground]=0)or(pole[i,j,ground]in[3,4]) then begin
              f:=true;
              Event2.x:=i;Event2.y:=j;
            end;
          end;
      if not f then begin
        Event2.code:=cmWho2;
        event2.ras:=race;
        n:=random(13);
        m:=0;
        for i:=x-1 to x+lenx do
          for j:=y-1 to y+leny do
            if (i>=0)and(j>=0)and(i<=maxx)and(j<=maxy)
            and(pole[i,j,ground]>=25)and(pole[i,j,0]<=32) then
            begin
              if m=n then begin
                Event2.x:=i;Event2.y:=j;
                inc(m);
              end
              else inc(m);
            end;
        flagwait:=true;
        if race=0
        then
          if ground=0 then begin
            message(mytank,event2);
            message(myRobot,event2)
          end
          else message(MyAir,event2);
        if race=1
        then
          if ground=0 then begin
            message(enemytank,event2);
            message(enemyRobot,event2)
          end
          else message(enemyAir,event2);
{        if Event2.code<>cmItIsWho then begin
          if ground=0 then message(vibortank,event2)
          else message(viborAir,event2);
        end;}
        if event2.code=cmItIsWho then
        begin
          for i:=(Event2.x)-1 to (Event2.x)+1 do
            for j:=(Event2.y)-1 to (Event2.y)+1 do
              if (i>0)and(j>0)and(i<maxx)and(j<maxy) then
              begin
                ff:=false;
                if (pole[i,j,ground]=0)or(pole[i,j,ground] in[3,4]) then begin
                  ff:=true;
                  Event2.otkogo^.moving:=true;
                  Event2.otkogo^.newx:=i;
                  Event2.otkogo^.newy:=j;
                  if race=0
                  then
                    if ground=0 then begin
                      message(mytank,event2);
                      message(myRobot,event2)
                    end
                    else message(MyAir,event2);
                  if race=1
                  then
                    if ground=0 then begin
                      message(enemytank,event2);
                      message(enemyRobot,event2)
                    end
                    else message(enemyAir,event2);
                end;
                if not ff then event2.watch:=cmNothing;
              end;
        end
        else Event2.watch:=cmNothing;
        exit;
      end;
      if ground=0 then begin
        if tipbuild in[24..25,66] then
          Event2.code:=cmRobot
        else
          Event2.code:=cmTank
      end
      else Event2.code:=cmAir;
      event2.buil:=@self;
      event2.ras:=race;
      Event2.tip:=tipBuild;
      Event2.ang:=random(7);
      Event2.newx:=event2.x;Event2.newy:=Event2.y;
      Event2.sx:=30;Event2.sy:=30;
      Event2.pow:=maspow[tipBuild];
      Event2.step:=2;
      event2.dis:=masdis[tipBuild];
      event2.tim:=masTime[tipBuild];
      event2.dam:=masDam[tipBuild];
      if tipbuild=31 then
      begin
        Event2.sx:=75;Event2.sy:=75;
{        Event2.pow:=500;
        event2.dis:=240+80;
        event2.dam:=30;
        event2.tim:=15;
        Event2.step:=1;}
      end;
{      if tipbuild in[30]
      then begin
        event2.dis:=200;
        event2.dam:=5;
        event2.tim:=10;
      end;}
      if tipbuild in[32]
      then begin
{        Event2.pow:=250;
        event2.dis:=200;
        event2.dam:=5;
        event2.tim:=10;}
        event2.step:=3;
      end;
{      if tipbuild in[33]
      then begin
        Event2.pow:=300;
        event2.dis:=240;
        event2.dam:=10;
        event2.tim:=15;
      end;}

      Event2.tm2:=0;
      event2.buil:=@self;
      if race=0
      then
        if ground=0
        then begin
          if tipbuild in[24..25]
          then Event2.komu:=MyRobot
          else Event2.komu:=Mytank;
        end
        else Event2.komu:=MyAir;
      if race=1
      then
        if ground=0
        then begin
          if tipbuild in[66]
          then
            Event2.komu:=enemyRobot
          else Event2.komu:=enemytank;
        end
        else Event2.komu:=enemyAir;

      message(desk,event2);
      build:=false;
      num:=0;
      newpanel[0]:=true;
      newpanel[1]:=true;
    end;
  end;
  if flagWait then begin
    f:=false;
    for i:=x-1 to x+lenx do
      for j:=y-1 to y+leny do
        if (i>0)and(j>0)and(i<maxx)and(j<maxy) then
        begin
          if (pole[i,j,ground]=0)or(pole[i,j,ground]=3) then begin
            f:=true;
            Event2.x:=i;Event2.y:=j;
            Event2.newx:=i;Event2.newy:=j;
          end;
        end;
    if f then begin
      flagwait:=false;
      Event2.watch:=cmEvent;
      if ground=0 then begin
        if tipbuild in[24..25,66] then
          Event2.code:=cmRobot
        else
          Event2.code:=cmTank
      end
      else Event2.code:=cmAir;
      event2.ras:=race;
      Event2.tm2:=0;
      event2.buil:=@self;
      Event2.tip:=tipBuild;
      Event2.ang:=random(7);
      Event2.sx:=30;Event2.sy:=30;
      Event2.pow:=maspow[tipBuild];
      Event2.step:=2;
      event2.dis:=masdis[tipBuild];
      event2.tim:=masTime[tipBuild];
      event2.dam:=masDam[tipBuild];
      if tipbuild=31 then
      begin
        Event2.sx:=75;Event2.sy:=75;
{        Event2.step:=1;}
      end;
{      if tipbuild in[30]
      then begin
        event2.dis:=200;
        event2.dam:=5;
        event2.tim:=10;
      end;}
      if tipbuild in[32]
      then begin
{        Event2.pow:=250;
        event2.dis:=200;
        event2.dam:=5;
        event2.tim:=10;}
        event2.step:=3;
      end;
      if tipbuild in[33]
      then begin
{        Event2.pow:=300;
        event2.dis:=240;
        event2.dam:=10;
        event2.tim:=15;}
      end;
      if ground=0
      then begin
        if tipbuild in[24..25]
        then Event2.komu:=MyRobot
        else Event2.komu:=Mytank;
      end
      else Event2.komu:=MyAir;
      message(desk,event2);
      num:=0;
      build:=false;
      newpanel[0]:=true;
      newpanel[1]:=true;
    end;
  end;
{**Конец посторойки**}
  if Event.watch=cmMouse then
  begin
    if Event.button=2 then
    begin
      if (selhouse=@self)and(numicon(Event.xm,Event.ym)=num) then
      begin
        num:=0;
        flagwait:=false;
        newpanel[0]:=true;
        newpanel[1]:=true;
        Event.watch:=cmevent;
        Event.code:=cmNoHouse;
        Event.tip:=tipbuild;
        money[0]:=money[0]+masCoast[tipBuild];
        message(desk,event);
        if (tip=112)and(tipbuild in[24..25] )
        then
        dec(number[race]);
        flagbuild:=0;
        build:=false;
      end;
    end;
    if Event.button=1 then
    begin
      if (selhouse=@self)and(flagbuild=buildhouse)and(numicon(Event.xm,Event.ym)=num)and(timebuild=0)then
      begin
{        flagbuild:=0;}
        Event2.watch:=cmevent;
        Event2.code:=cmHouse;
        Event2.tip:=tipbuild;
        event2.ras:=race;
        event2.pow:=300;
        event2.step:=0;
        event.tm2:=10;
        Event2.otkogo:=@self;
        message(desk,event2);
      end;
      if (ItisI(Event.xm,Event.ym))and(Event.xm<520) then
      begin
        if not desk^.remont
        then begin
          select:=1;sel:=@self;
          Event.watch:=cmMouse;
          Event.xm:=700;Event.ym:=700;
          if race=0
          then begin
            active:=1;
            selhouse:=@self;
            for i:=0 to maxicon do
              masflagicon[i]:=false;
            newpanel[0]:=true;
            newpanel[1]:=true;
            if (tip=111) then
            begin
              masflagicon[10]:=true;
              masflagicon[11]:=true;
              masflagicon[12]:=true;
              masflagicon[13]:=true;
              masflagicon[14]:=true;
              masflagicon[15]:=true;
              masflagicon[16]:=true;
              masflagicon[17]:=true;
            end;
            if (tip=112) then
            begin
              masflagicon[18]:=true;
              masflagicon[19]:=true;
            end;
            if (tip=113) then
            begin
              masflagicon[0]:=true;
              masflagicon[1]:=true;
              masflagicon[2]:=true;
              masflagicon[3]:=true;
              masflagicon[4]:=true;
              masflagicon[5]:=true;
{              masflagicon[6]:=true;}
            end;
            if (tip=114) then
            begin
              masflagicon[20]:=true;
              masflagicon[21]:=true;
              masflagicon[22]:=true;
              masflagicon[23]:=true;
              masflagicon[24]:=true;
            end;
          end;
        end
        else begin
          remont:=not(remont);
        end;
      end;
      if (active=1)and(Event.xm>520)and
      (flagbuild=0)and(not flagWait)and(not desk^.remont) then
      begin
        if numIcon(Event.xm,Event.ym)<>0 then
        begin
          newpanel[0]:=true;
          newpanel[1]:=true;
          case numIcon(Event.xm,Event.ym) of
            1:begin
                if (tip=111)and(money[0]>=masCoast[111])and(masMyFlagBuild[111])
                then begin
                  num:=1;
                  numicons:=10;
                  flagBuild:=buildHouse;
                  Flagwait:=false;
                  timebuild:=mastimebuild[111];
                  timebuild2:=timebuild;
                  tipbuild:=111;
                  ground:=0;
                end;
                if (tip=113)and(money[0]>=masCoast[30])
                then begin
                  num:=1;
                  numicons:=0;
                  flagBuild:=buildTech;
                  Flagwait:=false;
                  timebuild:=mastimebuild[30];
                  timebuild2:=timebuild;
                  tipbuild:=30;
                  ground:=1;
                end;
                if (tip=112)and(money[0]>=masCoast[24])and(number[race]<maxnumber[race])
                then begin
                  num:=1;
                  numicons:=18;
                  inc(number[race]);
                  flagBuild:=buildTech;
                  Flagwait:=false;
                  timebuild:=mastimebuild[24];
                  timebuild2:=timebuild;
                  tipbuild:=24;
                  ground:=0;
                end;
                if (tip=114)and(money[0]>=masCoast[27])
                 then begin
                  num:=1;
                  numicons:=20;
                  flagBuild:=buildTech;
                  Flagwait:=false;
                  timebuild:=mastimebuild[26];
                  timebuild2:=timebuild;
                  tipbuild:=26;
                  ground:=0;
                end;
              end;
            2:begin
                if (tip=111)and(money[0]>=masCoast[115])and(masMyFlagBuild[115])
                then begin
                  num:=2;
                  numicons:=11;
                  flagBuild:=buildHouse;
                  Flagwait:=false;
                  timebuild:=mastimebuild[115];
                  timebuild2:=timebuild;
                  tipbuild:=115;
                  ground:=0;
                end;
                if (tip=112)and(money[0]>=masCoast[25])and(number[race]<maxnumber[race])
                then begin
                  num:=2;
                  numicons:=19;
                  inc(number[race]);
                  flagBuild:=buildTech;
                  Flagwait:=false;
                  timebuild:=mastimebuild[25];
                  timebuild2:=timebuild;
                  tipbuild:=25;
                  ground:=0;
                end;
                if (tip=113)and(money[0]>=masCoast[32])
                then begin
                  num:=2;
                  numicons:=1;
                  flagBuild:=buildTech;
                  Flagwait:=false;
                  timebuild:=mastimebuild[32];
                  timebuild2:=timebuild;
                  tipbuild:=32;
                  ground:=1;
                end;
                if (tip=114)and(money[0]>=masCoast[28])
                 then begin
                  num:=2;
                  numicons:=21;
                  flagBuild:=buildTech;
                  Flagwait:=false;
                  timebuild:=mastimebuild[28];
                  timebuild2:=timebuild;
                  tipbuild:=28;
                  ground:=0;
                end;
              end;
            3:begin
                if (tip=111)and(money[0]>=masCoast[112])and(masMyFlagBuild[112])
                then begin
                  num:=3;
                  numicons:=12;
                  flagBuild:=buildHouse;
                  Flagwait:=false;
                  timebuild:=mastimebuild[112];
                  timebuild2:=timebuild;
                  tipbuild:=112;
                  ground:=0;
                end;
                if (tip=113)and(money[0]>=masCoast[31])
                then begin
                  num:=3;
                  numicons:=2;
                  flagBuild:=buildTech;
                  Flagwait:=false;
                  timebuild:=mastimebuild[31];
                  timebuild2:=timebuild;
                  tipbuild:=31;
                  ground:=1;
                end;
                if (tip=114)and(money[0]>=masCoast[29])
                then begin
                  num:=3;
                  numicons:=22;
                  flagBuild:=buildTech;
                  Flagwait:=false;
                  timebuild:=mastimebuild[29];
                  timebuild2:=timebuild;
                  tipbuild:=29;
                  ground:=0;
                end;
              end;
            4:begin
                if (tip=111)and(money[0]>=masCoast[114])and(masMyFlagBuild[114])
                then begin
                  num:=4;
                  numicons:=13;
                  flagBuild:=buildHouse;
                  Flagwait:=false;
                  timebuild:=mastimebuild[114];
                  timebuild2:=timebuild;
                  tipbuild:=114;
                  ground:=0;
                end;
                if (tip=113)and(money[0]>=masCoast[33])
                then begin
                  num:=4;
                  numicons:=3;
                  flagBuild:=buildTech;
                  Flagwait:=false;
                  timebuild:=mastimebuild[33];
                  timebuild2:=timebuild;
                  tipbuild:=33;
                  ground:=1;
                end;
                if (tip=114)and(money[0]>=masCoast[23])
                 then begin
                  num:=4;
                  numicons:=23;
                  flagBuild:=buildTech;
                  Flagwait:=false;
                  timebuild:=mastimebuild[23];
                  timebuild2:=timebuild;
                  tipbuild:=23;
                  ground:=0;
                end;
              end;
            5:begin
                if (tip=111)and(money[0]>=masCoast[113])and(masMyFlagBuild[113])
                then begin
                  num:=5;
                  numicons:=14;
                  flagBuild:=buildHouse;
                  Flagwait:=false;
                  timebuild:=mastimebuild[113];
                  timebuild2:=timebuild;
                  tipbuild:=113;
                  ground:=0;
                end;
                if (tip=113)and(money[0]>=masCoast[34])
                then begin
                  num:=5;
                  numicons:=4;
                  flagBuild:=buildTech;
                  Flagwait:=false;
                  timebuild:=mastimebuild[34];
                  timebuild2:=timebuild;
                  tipbuild:=34;
                  ground:=1;
                end;
                if (tip=114)and(money[0]>=masCoast[27])
                 then begin
                  num:=5;
                  numicons:=24;
                  flagBuild:=buildTech;
                  Flagwait:=false;
                  timebuild:=mastimebuild[27];
                  timebuild2:=timebuild;
                  tipbuild:=27;
                  ground:=0;
                end;
              end;
            6:begin
                if (tip=111)and(money[0]>=masCoast[116])and(masMyFlagBuild[116])
                then begin
                  num:=6;
                  numicons:=15;
                  flagBuild:=buildHouse;
                  Flagwait:=false;
                  timebuild:=mastimebuild[116];
                  timebuild2:=timebuild;
                  tipbuild:=116;
                  ground:=0;
                end;
                if (tip=113)and(money[0]>=masCoast[35])
                then begin
                  num:=6;
                  numicons:=5;
                  flagBuild:=buildTech;
                  Flagwait:=false;
                  timebuild:=mastimebuild[35];
                  timebuild2:=timebuild;
                  tipbuild:=35;
                  ground:=1;
                end;
              end;
            7:begin
                if (tip=111)and(money[0]>=masCoast[40])and(masMyFlagBuild[117])
                then begin
                  num:=7;
                  numicons:=16;
                  flagBuild:=buildHouse;
                  Flagwait:=false;
                  timebuild:=mastimebuild[40];
                  timebuild2:=timebuild;
                  tipbuild:=40;
                  ground:=0;
                end;
{                if (tip=113)and(money[0]>=masCoast[36])
                then begin
                  num:=7;
                  numicons:=6;
                  flagBuild:=buildTech;
                  Flagwait:=false;
                  timebuild:=mastimebuild[36];
                  timebuild2:=timebuild;
                  tipbuild:=36;
                  ground:=1;
                end;}
              end;
            8:begin
                if (tip=111)and(money[0]>=masCoast[41])and(masMyFlagBuild[118])
                then begin
                  num:=8;
                  numicons:=17;
                  flagBuild:=buildHouse;
                  Flagwait:=false;
                  timebuild:=mastimebuild[41];
                  timebuild2:=timebuild;
                  tipbuild:=41;
                  ground:=0;
                end;
              end;

          end;
          if flagBuild<>0
          then begin
            money[0]:=money[0]-masCoast[tipBuild];
          end;
        end;
      end;
    end;
  end;
end;

procedure tHouse.show;
var f,ff:boolean;
    xm,ym,but:word;
    i,j,xx,yy:integer;
    len:longint;
begin
  if (angle=25)then
    exit;
{  f:=false;
  for i:=x to x+lenx-1 do
    for j:=y to y+leny-1 do
      if pole2[i,j]<>0
      then begin
        f:=true;
        pole2[i,j]:=0;
      end;
  if (not f)and(not ShowAll)
  then exit;}
{  if ((x+(sizex div 40)>=polex)and(x-(sizey div 40)<=polex+15))
  and((y+(sizey div 40)>=poley)and(y-(sizey div 40)<=poley+11)) then}
  if ((x+lenx>=polex)and(x-lenx<=polex+15))
  and((y+leny>=poley)and(y-leny<=poley+11)) then
  begin
    f:=true;
{    xm:=mousex;
    ym:=mousey;
    if (((x-polex)*40<xm) and ((x-polex)*40+(sizex)>xm)
    and ((y-poley)*40<ym) and ((y-poley)+(sizey)*40>ym))then
      f:=true;}
    if f then hidemouse;
    xx:=(x-polex)*40;
    yy:=(y-poley)*40;
    putsprite(xx,yy,houses[tip,angle]);
    if (remont)and(not died)
    then putsprite(xx+(sizex div 2),yy+(sizey div 2),pict[1+movex]);
    if select=1 then begin
      if race=0 then setcolor(white)
      else setcolor(12);
      line(xx,yy,xx+8,yy);
      line(xx,yy,xx,yy+20);
      line(xx+sizex,yy+sizey,xx-20+sizex,yy+sizey);
      line(xx+sizex,yy+sizey-20,xx+sizex,yy+sizey);
      line(xx+sizex,yy,xx-8+sizex,yy);
      line(xx+sizex,yy,xx+sizex,yy+20);
      line(xx,yy+sizey,xx+20,yy+sizey);
      line(xx,yy+sizey-20,xx,yy+sizey);

      if race=0 then rectangle(xx+ramkax+9,yy+ramkay-kkk-2,xx+ramkax+sizex-9,yy+ramkay-kkk+2,15,15)
      else rectangle(xx+ramkax+9,yy+ramkay-kkk-2,xx+ramkax+sizex-9,yy+ramkay-kkk+2,12,12);
      len:=round(power/power1*(sizex-20));

{      writexy(xx+ramkax+10,yy+ramkay-kkk-1,xx+ramkax+10);
      writexy(xx+ramkax+10,yy+ramkay-kkk-1+20,yy+ramkay-kkk-1);}

      if len>=1 then setcolor(red);
      if len>=(sizex-20)*1/3 then setcolor(yellow);
      if len>=(sizex-20)*2/3 then setcolor(green);
      if len+10>=sizex div 2 then begin
{        bar(xx+ramkax+10,yy+ramkay-kkk-1,xx+ramkax+sizex div 2,yy+ramkay-kkk+1);}
        line(xx+ramkax+10,yy+ramkay-kkk-1,xx+ramkax+sizex div 2,yy+ramkay-kkk-1);
        line(xx+ramkax+10,yy+ramkay-kkk,xx+ramkax+sizex div 2,yy+ramkay-kkk);
        line(xx+ramkax+10,yy+ramkay-kkk+1,xx+ramkax+sizex div 2,yy+ramkay-kkk+1);

        line(xx+ramkax+sizex div 2,yy+ramkay-kkk-1,xx+ramkax+sizex div 2+len-(sizex-20)div 2,yy+ramkay-kkk-1);
        line(xx+ramkax+sizex div 2,yy+ramkay-kkk,xx+ramkax+sizex div 2+len-(sizex-20)div 2,yy+ramkay-kkk);
        line(xx+ramkax+sizex div 2,yy+ramkay-kkk+1,xx+ramkax+sizex div 2+len-(sizex-20)div 2,yy+ramkay-kkk+1);
      end
      else
      begin
        line(xx+ramkax+10,yy+ramkay-kkk-1,xx+ramkax+len+10,yy+ramkay-kkk-1);
        line(xx+ramkax+10,yy+ramkay-kkk,xx+ramkax+len+10,yy+ramkay-kkk);
        line(xx+ramkax+10,yy+ramkay-kkk+1,xx+ramkax+len+10,yy+ramkay-kkk+1)
      end
    end;
    if f then showmouse;
  end;
end;

{***************************Robot*************************************}
procedure tRobot.save;
begin
  inherited save;
end;

procedure tRobot.load2;
begin
  inherited load2;
end;

procedure tRobot.CheckTarget;
var event2:tEvent;
begin
  case sost of
    1:begin {ищем свой ref}
        if prov(x,y,newx,newy,sxx,syy,0)or(not moving) then
        begin
          newx:=x;newy:=y;
          sost:=3;
{          angle:=4;}
          event2.watch:=cmEvent;
          event2.code:=cmWho4;
          event2.komu:=builder;
          if race=0
          then message(myhouse,event2)
          else message(enemyhouse,event2);
          if event2.code=cmItIsWho
          then begin
            newx:=event2.x;
            newy:=event2.y;
            sxx:=event2.sx;
            syy:=event2.sy;
            moving:=true;
            sost:=2;
            if money[race]<=100000-5 then Money[race]:=money[race]+5;
            if race=0 then
            begin
              newMoney[0]:=true;
              newMoney[1]:=true;
            end;
          end;
        end;
      end;
    2:begin {ищем ближ ценр}
        if prov(x,y,newx+1,newy+1,sxx,syy,0){and(not moving)} then
        begin
          newx:=x;newy:=y;
          if pousetime=pouse then
          begin
            pole[x,y,0]:=0;
            angle:=25;
{=====IAmDied===========}
            Event2.watch:=cmevent;
            Event2.code:=cmIAmDied;
            Event2.otkogo:=@self;
            if race=0
            then begin
              message(enemytank,event2);
              message(enemyair,event2);
            end;
            if race=1
            then begin
             message(vibortank,event2);
             message(mytank,event2);
             message(viborair,event2);
             message(myair,event2);
             message(myhouse,event2);
             message(myTurret,event2);
            end;
            message(rocet,event2);
            message(deleting,event2);
{=====IAmDied===========}
          end;
          if pousetime>0
          then dec(pousetime)
          else begin
            angle:=random(7);
            sost:=3;
            pousetime:=pouse;
            pole[x,y,0]:=tip;
            event2.watch:=cmEvent;
            event2.code:=cmWho3;
            event2.tip:=111+10*race;
            event2.oldx:=x;event2.oldy:=y;
            if race=0 then message(myhouse,event2)
            else message(enemyhouse,event2);
            if event2.pow=cmItIsWho then begin
              newx:=event2.x;
              newy:=event2.y;
              sxx:=event2.sx;
              syy:=event2.sy;
              moving:=true;
              sost:=1;
            end;
          end;
        end;
      end;
  end;
end;

procedure tRobot.HandleEvent(var Event:tEvent);
var i1,j1,i,j:integer;
    fnew:boolean;
    event2:tevent;
begin
  if (step=0) then begin
    pole2[x,y]:=1;
    if tip=41 then begin
      pole2[x,y-1]:=1;
      pole2[x+1,y]:=1;
      pole2[x+1,y-1]:=1;
    end
  end
  else if moving then modifpole2(x,y,tip)
       else pole2[x,y]:=1;
  if (event.watch=cmEvent)and(event.code=cmFire)and
  (not attack)and(tip in[41])and(not((step=0)and(maxenerge[race]<energe[race])))then
  begin
    if angletime>0 then dec(angletime)
    else begin
      inc(angle);
      angletime:=time4;
    end;
    if angle>7 then angle:=0;
  end;

  if (flagradar[page])and(event.watch=cmEvent)
  and(event.code=cmFire) then
  begin
    flagradar[page]:=false;
    setwsize(0,0,640,480);
{  if pole[oldx,oldy,1]=0
  then begin}
    putpixel(radarx+oldx,radary+oldy,diedcolor);
    if pole[oldx,oldy,0] in[116,205]
    then putpixel(radarx+oldx,radary+oldy,mycolor);
    if pole[oldx,oldy,0] in[126,206]
    then putpixel(radarx+oldx,radary+oldy,enemycolor);
{  end;}
    if pole[oldx,oldy,1]<>0 then
    begin
      event2.watch:=cmEvent;
      event2.code:=cmRadar;
      event2.x:=oldx;
      event2.y:=oldy;
      if pole[oldx,oldy,1]in[30..34]
      then begin
      message(myair,event2);
      message(viborair,event2);
      end;
      if pole[oldx,oldy,1]in[76..80]
      then message(enemyair,event2);
    end;
    if (died)and(pole[x,y,1]=0) then
    begin
      putpixel(radarx+x,radary+y,diedcolor);
    end;
    if (pole[x,y,1]=0)and(not died)and(owner<>deleting)and((not flagcloack)or(race=0))
    then putpixel(radarx+x,radary+y,color);
    setwsize(0,0,520,480);
  end;
  if flagac[0]<>0 then  begin
    if flagac[0]=2 then
      modifpole2(x,y,1);
    if flagac[0]=1 then
      pole2[x,y-1]:=1;
    if pag<>page then
      flagac[0]:=0;
  end;

  if (died)and(event.watch=cmevent)
  and(Event.code=cmFire)
  then begin
    if(not flagfff)and(angle=25)and(race=1)
    then begin
      if step=0
      then begin
        flagNewBuild:=true;
      end;
      if tip=67
      then begin
        zahvat:=false;
        flag67:=false;
        complet:=true;

        event2.watch:=cmEvent;
        event2.code:=cmPutHouse;
        event2.x:=x;
        event2.y:=y;
        message(desk,event2);
        flagfff:=true;
        inc(maxbuild[122]);
        flagTiberium:=5;
        flagNewBuild:=true;
      end;
    end;
    if phase=0
    then begin
      if (defenHouse<>nil)
      then begin
        if (step=0)
        then begin
          event2.watch:=cmEvent;
          event2.code:=cmDecTurret;
          event2.tip:=oldtip;
          message(defenHouse,event2);
        end;
        if step<>0
        then begin
          event2.watch:=cmEvent;
          event2.code:=cmDecDefen;
          event2.pow:=gr;
          message(defenHouse,event2);
        end;
        defenHouse:=nil;
      end;
      if repair<>nil
      then begin
        event2.watch:=cmEvent;
        event2.code:=cmUnRepair;
        message(repair,event2);
        repair:=nil;
      end;
      flagcloack:=false;
      if (race=1)and(step<>0)
      then begin
        if defenHouse<>nil then inc(kolTank);
        if patr
        then begin
          patrol[0]:=true;
          inc(kolPatrol[0]);
        end;
      end;
(*      if (oldtip=67)
      then begin
{        inc(kolTank);}
        zahvat:=false;
        flag67:=false;
        complet:=true;
      end;*)
      if((race=0)and(not(pole[x,y,0]in[116,205]))
      or((race=1)and(not(pole[x,y,0]in[126,206]))))
      then pole[x,y,0]:=0;
      if((race=0)and(not(pole[oldx,oldy,0]in[116,205]))
      or((race=1)and(not(pole[oldx,oldy,0]in[126,206]))))
      then pole[oldx,oldy,0]:=0;
      if (movex>0)and(movey=0) then
        pole[x+1,y,0]:=0;
      if (movey>0)and(movex=0) then
        pole[x,y+1,0]:=0;
      if (movex<0)and(movey=0) then
        pole[x-1,y,0]:=0;
      if (movey<0)and(movex=0) then
        pole[x,y-1,0]:=0;
      if (movex<0)and(movey<0) then
        pole[x-1,y-1,0]:=0;
      if (movex>0)and(movey>0) then
        pole[x+1,y+1,0]:=0;
      if (movex<0)and(movey>0) then
        pole[x-1,y+1,0]:=0;
      if (movex>0)and(movey<0) then
        pole[x+1,y-1,0]:=0;

      select:=0;
{      step:=0;}
    end;
    if timephase>0 then dec(timephase)
    else begin
      timephase:=1;
      modifpole2(x,y,tip);
      if phase<=maxphase then begin
        angle:=phase;
      end
      else angle:=25;
      if phase=maxphase+2 then
      begin
        event2.watch:=cmEvent;
        Event2.otkogo:=@self;
        event2.code:=cmDel;
        message(owner,event2);
        event2.watch:=cmNothing;
      end;
      inc(phase);
    end;
{    exit;}
  end;

  if (pole[x,y,0]=0)and(not load[1])and(not died)and(sost<>2) then pole[x,y,0]:={pole[x,y]+}tip;
  if ((x<>newx)or(y<>newy))and(not moving)and(not flaggo)and(step<>0)then
  begin
    moving:=true;
    flaggo:=true;
  end;
  if event.watch=cmEvent then
  begin
    Case Event.code of
      cmFire:begin
             if(race=1)and(power<(power1 div 3)*2)
             and(step=0)
             then remont:=true;
             if remont
             then begin
               if remontTime>0
               then dec(remontTime)
               else begin
                 movex:=1-movex;
                 if power<power1
                 then begin
                   inc(power);
                   remontTime:=time6;

                   if (power/power1)<=1/3 then flagSmoke:=1
                   else flagSmoke:=0;

                 end
                 else remont:=false;
               end;
             end;
             checkTarget;
             if (not died)and(moving)and(step<>0) then
             begin
               go;
             end;
           end;
      cmSelect:begin
                 if select=0 then
                   select:=1;
                 if tip in[40..45] then
                   sel:=@self;
               end;
      cmUnselect:begin
                   if select=1 then
                   begin
                     select:=0;
                     modifpole2(x,y,tip);
                     fff:=true;
                     flagac[0]:=2;
                     pag:=page;
                   end;
                 end;
      cmDecPower:begin
                   if (event.tip=0)and(event.otkogo<>@self)and(event.komu=@self)
                   and(((event.x=x)and(event.y=y))or((event.x=oldx)and(event.y=oldy)))
                   and(not died) then
                   begin
                     fnew:=false;
                     if (((x=newx)and(y=newy)))or((sostWay<>255)and(race=1))
                     and((attack=false){or(sostWay=100)})and(distance<>0) then
                       fnew:=true;
                     if (attack)and(target<>nil)and(not fnew)
                     and(step=0)
                     then begin
                       event2.watch:=cmEvent;
                       event2.code:=cmGetxy;
                       Event2.komu:=target;
                       message(target,event2);
                       if (rasst(x*40,y*40,Event2.x*40,event2.y*40)>distance)
                       then
                         fnew:=true;
                     end;
                     if fnew then
                     begin
                       if (event.otkogo<>nil)and not(tip in[24,25])
                       then begin
                         if (event.otkogo^.gr=tipattack)or(tipattack=2)
                         then begin
                           target:=Event.otkogo;
                           attack:=true;
                           tiptar:=event.otkogo^.gr;
                           tarx:=Event.otkogo^.x*40;
                           tary:=Event.otkogo^.y*40;
                           if rasst(x*40,y*40,Event.otkogo^.x*40,event.otkogo^.y*40)>distance
                           then begin
{                             if sostway in[100]
                             then begin
                               sostway:=99;
                               oldnewx2:=newx;
                               oldnewy2:=newy;
                             end;}
                             newx:=Event.otkogo^.x;
                             newy:=event.otkogo^.y;
                             moving:=true;
                           end;
                         end;
                       end;
{                       else begin
                         readkey;
                       end;}
                     end;
                     if power-Event.pow>0
                     then begin
                       power:=power-Event.pow;

                       if (power/power1)<=1/3 then flagSmoke:=1
                       else flagSmoke:=0;

                     end
                     else begin

                       if flagplay>300
                       then flagplay:=300;

                       Event2.watch:=cmevent;
                       if builder<>nil then
                       begin
                         event2.code:=cmDecNumber;
                         event2.komu:=builder;
                         message(builder,event2);
                         builder:=nil;
                       end;
                       Event2.code:=cmIAmDied;
{                       Event.komu:=@self;}
                       Event2.otkogo:=@self;
                       if (race=0)
                       then begin
                         message(enemytank,event2);
                         message(enemyRobot,event2);
                         message(enemyair,event2);
                         message(enemyTurret,event2);
                         if gr=0 then message(myair,event2);
                       end;
                       if (race=1)
                       then begin
                        message(vibortank,event2);
                        message(mytank,event2);
                        message(viborRobot,event2);
                        message(myRobot,event2);
                        message(viborair,event2);
                        message(myair,event2);
                        message(myTurret,event2);
                       end;
                       message(rocet,event2);
                       message(deleting,event2);

                       if (chrono)and(select=1)
                       and(chronoCur)
                       then chronoCur:=false;
                       flagradar[0]:=true;
                       flagradar[1]:=true;
                       attack:=false;
                       oldtip:=tip;
                       died:=true;
                       phase:=0;
                       tip:=45;
                       maxphase:=11;
                       exit;
                     end;
                     Event.watch:=cmNothing;
                   end;
                 end;

    end;
  end;
  inherited handleevent(event);
{  if(pole[x,y,0]<>tip)and(not moving) then
  begin
    for i:=x-1 to x+1 do
      for j:=y-1 to y+1 do
        if (i>=0)and(i<=maxx)and(j>=0)and(j<=maxx)then
        begin
          if (pole[i,j,0]=0)
          then begin
            newx:=i;newy:=j;
            if not flaggo then begin
              moving:=true;
              flaggo:=true;
            end;
          end;
        end;
    pole[x,y,0]:=0;
    flag:=true;
  end;
{  if moving then go;}
end;

procedure tRobot.Go;
var ff,xx,yy,fx,fy:byte;{0-влево,вниз ,1-вправо,вверх}
    i,j,num:integer;
    f,ffff:boolean;
    event2:tEvent;

  function aaa:integer;
  var n:integer;
  begin
    if (dx=1)and(dy=0) then n:=0;
    if (dx=1)and(dy=-1) then n:=1;
    if (dx=0)and(dy=-1) then n:=2;
    if (dx=-1)and(dy=-1) then n:=3;
    if (dx=-1)and(dy=0) then n:=4;
    if (dx=-1)and(dy=1) then n:=5;
    if (dx=0)and(dy=1) then n:=6;
    if (dx=1)and(dy=1) then n:=7;
    aaa:=n;
  end;

  procedure bbb(num:integer);
  begin
    case num of
      0:begin dx:=1;dy:=0;end;
      1:begin dx:=1;dy:=-1;end;
      2:begin dx:=0;dy:=-1;end;
      3:begin dx:=-1;dy:=-1;end;
      4:begin dx:=-1;dy:=0;end;
      5:begin dx:=-1;dy:=1;end;
      6:begin dx:=0;dy:=1;end;
      7:begin dx:=1;dy:=1;end;
    end;
  end;

  procedure selectgo;
  var n:integer;
  begin
    dx:=0;dy:=0;
    if (newx>x) then begin
      dx:=1;
    end;
    if (newx<x) then begin
      dx:=-1
    end;
    if (newy>y) then begin
      dy:=1;
    end;
    if (newy<y) then begin
      dy:=-1
    end;

    if (not(pole[x+dx,y+dy,0] in[0,3,4]))and
    not((pole[x+dx,y+dy,0]in[116,205])and(sost in[10,11])) then
    begin
      num:=aaa;
      n:=0;
      repeat
        inc(num);inc(n);
        if num=8 then num:=0;
        bbb(num);
        if (x+dx>maxx)or(y+dy>maxy)
        or(y+dy<0)or(x+dx<0) then begin
          dx:=0;dy:=0;
        end;
      until (pole[x+dx,y+dy,0]=0)or(pole[x+dx,y+dy,0]=3)or(n=8);
      if (n=8)and(not(pole[x+dx,y+dy,0]in[0,3,4])) then begin
        dx:=0;dy:=0;
      end;
    end;
  end;

begin
  if (x=newx)and(y=newy)and(movex=0)and(movey=0) then
  begin
    if (not flag)
    and((race=0)and(not(pole[oldx,oldy,0]in[116,205]))
    or((race=1)and(not(pole[oldx,oldy,0]in[126,206]))))
    and not((oldx=x)and(oldy=y))
    then pole[oldx,oldy,0]:=0;
    if tip in[67]
    then begin
      died:=true;
      event2.watch:=cmEvent;
      Event2.code:=cmIAmDied;
      Event2.otkogo:=@self;
      if (race=0)
      then begin
        message(enemytank,event2);
        message(enemyRobot,event2);
        message(enemyair,event2);
        message(enemyTurret,event2);
      end;
      if (race=1)
      then begin
       message(vibortank,event2);
       message(mytank,event2);
       message(viborRobot,event2);
       message(myRobot,event2);
       message(viborair,event2);
       message(myair,event2);
       message(myTurret,event2);
      end;
      message(rocet,event2);
      message(deleting,event2);
    end;

    oldx:=x;oldy:=y;
    if (sostWay in[255,100])or(tip in[24..25,66])or(race=0)
    then moving:=false
    else
      if (not attack)and(race=1)
      then begin
        newx:=Way[sostway,0];
        newy:=Way[sostway,1];
        inc(sostWay);
        if SostWay>4 then sostway:=0;
      end;
    flag:=false;
    fff:=false;
    modifpole2(x,y,tip);
    exit;
  end;
  fff:=true;
  modifpole2(x,y,tip);
  if GoTime>0 then dec(GoTime)
  else
  begin
    fx:=2;fy:=2;ff:=0;
    GoTime:=Time2;
    modifpole2(x,y,tip);
    if (newx<0)or(newx>maxx)or(newy<0)or(newy>maxy)
    then begin
      newx:=x;
      newy:=y;
      sound(500);
      delay(100);
      nosound;
    end;
    if (not(pole[newx,newy,0] in[0,3,4]))
    and(not(x=newx)and(y=newy))and(dx=0)and(dy=0)
    and(not(sost in[10,11]))
    then begin
      ffff:=false;
{      if (attack)and(Target<>nil)
      then begin
        event2.watch:=cmEvent;
        event2.code:=cmGetTip;
        event2.komu:=target;
        message(target,event2);
        if event2.code=cmItIsWho
        then begin
          if (event2.tip)in[110..130]
          then ffff:=true;
        end
        else begin
          target:=nil;
          attack:=false;
        end;
      end;}
      if not ffff
      then begin
        f:=false;
  {      newx:=x+(movex div (40 div step));newy:=y+(movey div(40 div step));}
        xx:=newx;yy:=newy;
        for i:=xx-1 to xx+1 do
          for j:=yy+1 downto yy-1 do
            if (i>0)and(j>0)and(i<maxx)and(j<maxy)then
            begin
              if pole[i,j,0]=0 then
              begin
                newx:=i;newy:=j;f:=true;
              end;
            end;
        if not f then begin
          newx:=x+(movex div(40 div step));
          newy:=y+(movey div(40 div step));
        end;
      end;
    end;

    if (movex=0)and(movey=0)then begin
      if ((not flag)and(x<>oldx)or(y<>oldy)){and((x>0)and(y>0)and(x<maxx)and(y<maxy))}then
        if ((race=0)and(not(pole[oldx,oldy,0]in[116,205]))
        or((race=1)and(not(pole[oldx,oldy,0]in[126,206]))))
{        and(not((oldx=x+dx)and(oldy=y+dy)))}
        then
          pole[oldx,oldy,0]:=0;
        selectgo;
{      if (dx<>0)and(dy<>0) then begin}
{        oldpole:=pole[x+dx,y+dy,0];}
        if ((race=0)and(not(pole[x+dx,y+dy,0]in[116,205]))
        or((race=1)and(not(pole[x+dx,y+dy,0]in[126,206]))))
        then
          pole[x+dx,y+dy,0]:={pole[x+dx,y+dy]+}tip;
        oldx:=x;oldy:=y;
{      end;}
    end;
    if (dx=1) then begin
      fx:=1;
      if movex<20/step-1 then inc(movex) else begin
        oldx:=x;ff:=1;
        inc(x);dx:=0;
                       flagradar[0]:=true;
                       flagradar[1]:=true;

        movex:=-20 div step;
      end;
    end;
    if (dx=-1) then begin
      fx:=0;
      if movex>-20/step+1 then dec(movex) else begin
        oldx:=x;ff:=1;
        dec(x);dx:=0;
                       flagradar[0]:=true;
                       flagradar[1]:=true;

        movex:=20 div step;
      end;
    end;
    if (dy=1) then begin
      fy:=0;
      if movey<20/step-1 then inc(movey) else begin
        oldy:=y;ff:=1;
        inc(y);dy:=0;
                       flagradar[0]:=true;
                       flagradar[1]:=true;

        movey:=-20 div step;
      end;
    end;
    if (dy=-1) then begin
      fy:=1;
      if movey>-20/step+1 then dec(movey) else begin
        oldy:=y;ff:=1;
        dec(y);dy:=0;
                       flagradar[0]:=true;
                       flagradar[1]:=true;

        movey:=20 div step;
      end;
    end;
    if (dx=0) and (dy=0) then
    begin
      if movey>0 then begin
        dec(movey);
      end;
      if movey<0 then begin
        inc(movey);
      end;
      if movex>0 then begin
        dec(movex);
      end;
      if movex<0 then begin
        inc(movex);
      end;
    end;
    if (fx=0) then angle:=4;
    if (fx=1) then angle:=0;
    if (fy=0) then angle:=6;
    if (fy=1) then angle:=2;
    if (fx=0)and(fy=0) then angle:=5;
    if (fx=0)and(fy=1) then angle:=3;
    if (fx=1)and(fy=0) then angle:=7;
    if (fx=1)and(fy=1) then angle:=1;

  end;
{  putsprite(0,0,dirt[0]);
  putsprite(30,0,dirt[0]);
  putsprite(60,0,dirt[0]);
  setcolor(0);
  str(x,st);
  outtextxy(0,0,st);
  str(y,st);
  outtextxy(15,0,st);
  str(newx,st);
  outtextxy(0,15,st);
  str(newy,st);
  outtextxy(15,15,st);}
end;

constructor tRobot.init2;
begin
  inherited init2;
  target:=nil;
end;

constructor tRobot.init(xx,yy,nwx,nwy,olx,oly,mvx,mvy,pow,pow1:integer;
                        ras,sel,tt,ang:byte;sx,sy,st,tm2:integer;
                        mov:boolean;ramx,ramy:integer;buil:pObject);
var event2:tEvent;
begin
  tip:=tt;angle:=ang;
  inherited init;
  x:=xx;y:=yy;newx:=nwx;newy:=nwy;
  oldx:=olx;oldy:=oly;
  oldnewx:=newx;oldnewy:=newy;
  pole[x,y,0]:={pole[x,y]+}tip;
  power1:=pow1;power:=pow;
  energy:=0;energy1:=0;
  TimeInc:=time12;
  sizex:=sx;sizey:=sy;
  movex:=0;movey:=0;moving:=false;
  step:=st;time2:=tm2;
  gotime:=tm2;
  select:=sel;race:=ras;
  moving:=mov;
  flag:=false;
  ramkax:=ramx;ramkay:=ramy;
  flagac[0]:=0;
  flagac[1]:=0;
  firetime:=50;
  sprx:=0;spry:=0;
  attack:=false;
  died:=false;
  phase:=0;
  maxphase:=0;
  timephase:=0;
  sost:=2;
  builder:=buil;
  pousetime:=pouse;
  kkk:=0;
  if race=0 then color:=mycolor else color:=enemycolor;
  flagradar[0]:=true;
  flagradar[1]:=true;
          event2.watch:=cmEvent;
          event2.code:=cmWho4;
          event2.komu:=builder;
          message(myhouse,event2);
          if event2.code=cmItIsWho then begin
            newx:=event2.x;
            newy:=event2.y;
            sxx:=event2.sx;
            syy:=event2.sy;
            moving:=true;
            sost:=1;
          end;
{  sxx:=0;syy:=0;}
  tipattack:=0;
  gr:=0;
  tiprocet:=0;
  cloack:=false;
  flagcloack:=false;
  detector:=false;
  fillchar(gruppa,sizeOF(gruppa),false);
  repair:=nil;
  sostWay:=255;
  if race=0 then sostWay:=5;
  remont:=false;
  defenHouse:=nil;
  patr:=false;
  timeSmoke:=0;
  if (power/power1)<=1/3 then flagSmoke:=1
  else flagSmoke:=0;
  load[0]:=false;
  load[1]:=false;
  chron[1]:=0;
  chron[2]:=0;
  kolLoad:=0;
end;

destructor tRobot.done;
begin
{  pole[x,y,0]:=0;
  if movex>0 then
    pole[x+1,y,0]:=0;
  if movey>0 then
    pole[x,y+1,0]:=0;
  if movex<0 then
    pole[x-1,y,0]:=0;
  if movey<0 then
    pole[x,y-1,0]:=0;}
  inherited done;
end;

procedure tRobot.show;
begin
  inherited show;
end;

{***************************Tank*************************************}
procedure tTank.save;
begin
  inherited save;
end;

procedure tTank.load2;
begin
  inherited load2;
end;

procedure tTank.CheckTarget;
begin
end;

procedure tTank.HandleEvent(var Event:tEvent);
var i1,j1,i,j:integer;
    tar:tTarget;
    event2:tEvent;
    fnew:boolean;
    p:pointer;
begin
{  if(select=0)and(sel=@self)then
    select:=1;}
  if Event.watch=cmEvent then begin
    case event.code of
      cmAttack:if (race=0)and not((step=0)and(select=0))
               then begin
                 if (event.ground=tipAttack)or(tipAttack=2) then
                 begin
                   attack:=true;
                   tiptar:=event.ground;
                   target:=Event.otkogo;
                   tarx:=Event.otkogo^.x*40;
                   tary:=event.otkogo^.y*40;
                   if{(step<>0)and}(rasst(x*40,y*40,tarx,tary)>distance) then
                   begin
                     if step<>0
                     then begin
                       newx:=Event.otkogo^.x;
                       newy:=event.otkogo^.y;
                       moving:=true;
                       sost:=3;
                     end
                     else begin
                       attack:=false;
                       target:=nil;
                     end;
                   end;
                 end
                 else begin
                   newx:=Event.otkogo^.x;
                   newy:=event.otkogo^.y;
                   moving:=true;
                   sost:=3;
                 end;
               end;
      cmFire:if (not died)and not((step=0)and(maxenerge[race]<energe[race])) then
             begin
               if(((x=newx)and(y=newy))or((movex=0)and(movey=0)
               and((sostWay<>255)and(race=1))))
               and((attack=false){or(sostway=100)})
               then begin
                p:=seektarget(x,y,distance);
                 if p<>nil then begin
{                   moving:=false;}
{                   if (sostWay in[100])
                   then begin
                     moving:=true;
                     oldnewx2:=newx;oldnewy2:=newy;
                     sostway:=99;
                   end;}
                   newx:=x;newy:=y;

                   event2.watch:=cmEvent;
                   event2.code:=cmGetxy;
                   event2.komu:=p;
                   message(p,event2);
                   attack:=true;
                   target:=p;
                   tiptar:=event2.ground;
                   tarx:=Event2.x*40;
                   tary:=Event2.y*40;
                 end;
               end;
               if firetime>0 then dec(firetime);
               if (target<>nil)and(attack) then
               begin
                 if (((x=newx)and(y=newy))or(step=0))
                 and(rasst(x*40,y*40,tarx,tary)>distance) then
                 begin
                   if step<>0
                   then begin
                     event2.watch:=cmEvent;
                     event2.code:=cmGetXY;
                     event2.komu:=target;
                     message(target,event2);
                     if not event2.mov
                     then begin
                       newx:=event2.x;newy:=event2.y;
                     end
                     else begin
                            target:=nil;
                            attack:=false;
                            newx:=x;newy:=y;
                          end;
                     moving:=true;
                   end
                   else begin
                     attack:=false;
                     target:=nil;
                   end
                 end;
               end;
               if (attack)and(target<>nil)and(firetime=0)then
               begin
                 event2.watch:=cmEvent;
                 Event2.code:=cmGetXY;
                 event2.komu:=target;
                 message(target,event2);
                 if not event2.mov
                 then begin
                   if (event2.x<=100)or(event2.x>=0)then
                     tarx:=(event2.x*40+10);
                   if (event2.y<=100)or(event2.y>=0)then
                     tary:=(event2.y*40+10);
                 end
                 else begin
                        target:=nil;
                        attack:=false;
                        newx:=x;newy:=y;
                      end;
               end;
               if (step<>0)and(attack)and(moving) then begin
                 if (rasst(x*40,y*40,tarx,tary)<=distance)
                 then begin
                   newx:=x;newy:=y;{moving:=false;}
                 end
                 else begin
                   event2.mov:=true;
                   event2.watch:=cmEvent;
                   event2.code:=cmGetXY;
                   event2.komu:=target;
                   message(target,event2);
{                   aa:=tip;}
                   if not event2.mov
                   then begin
                     newx:=event2.x;newy:=event2.y;
                   end
                   else begin
                          target:=nil;
                          attack:=false;
                          newx:=x;newy:=y;
                        end;
                   moving:=true;
                 end;
               end;
               if (target<>nil)and(firetime=0)and(attack=true)
               and({(step=0)or}(rasst(x*40,y*40,tarx,tary)<=distance))
               then begin
                 firetime:=time3;
                 tar.watch:=cmKoord;
                 tar.x:=tarx;tar.y:=tary;
                 if (not moving)or(step=0)or((sostWay<>255)and(race=1)) then
                   angle:=ang(x,y,tarx div 40,tary div 40);

                 if (step=0)and(flagplay>500)
                 then flagplay:=500;
                 if (step<>0)
                 then begin
                   if (flagplay>800)
                   then flagplay:=800;
                   if (tip in[27])and(flagplay>750)
                   then flagplay:=750;
                 end;
                 case angle of
                   0:pgroup(rocet)^.insert(new(pRocet,init(x*40+sizex+sprx,spry+y*40+(sizey div 2),0,0,5,5,
                   tar,damage,target,@self,tiprocet,tiptar)));
                   4:pgroup(rocet)^.insert(new(pRocet,init(x*40+sprx,spry+y*40+(sizey div 2),0,0,5,5,
                   tar,damage,target,@self,tiprocet,tiptar)));
                   2:pgroup(rocet)^.insert(new(pRocet,init(x*40+(sizex div 2)+sprx,spry+y*40,0,0,5,5,
                   tar,damage,target,@self,tiprocet,tiptar)));
                   6:pgroup(rocet)^.insert(new(pRocet,init(x*40+(sizex div 2)+sprx,spry+y*40+sizey,0,0,5,5,
                   tar,damage,target,@self,tiprocet,tiptar)));
                   1:pgroup(rocet)^.insert(new(pRocet,init(x*40+sizex+sprx,spry+y*40,0,0,5,5,
                   tar,damage,target,@self,tiprocet,tiptar)));
                   3:pgroup(rocet)^.insert(new(pRocet,init(x*40+sprx,spry+y*40,0,0,5,5,
                   tar,damage,target,@self,tiprocet,tiptar)));
                   5:pgroup(rocet)^.insert(new(pRocet,init(x*40+sprx,spry+y*40+sizey,0,0,5,5,
                   tar,damage,target,@self,tiprocet,tiptar)));
                   7:pgroup(rocet)^.insert(new(pRocet,init(x*40+sizex+sprx,spry+y*40+sizey,0,0,5,5,
                   tar,damage,target,@self,tiprocet,tiptar)));
                 end;
               end;
             end;
    end;
  end;
  inherited handleevent(event);
end;

constructor ttank.init2;
begin
  inherited init2;
end;

constructor tTank.init(xx,yy,nwx,nwy,olx,oly,mvx,mvy,pow,pow1:integer;
                        ras,sel,tt,ang:byte;sx,sy,st,tm2:integer;
                        mov:boolean;ramx,ramy:integer;dist,dam,ft:integer;defhouse:pObject;
                        sWay:byte;pat:boolean);
begin
  inherited init(xx,yy,nwx,nwy,olx,oly,mvx,mvy,pow,pow1,
  ras,sel,tt,ang,sx,sy,st,tm2,mov,ramx,ramy,nil);
  if tip in[40..42] then inc(energe[race]);
  if tip in[70..72] then inc(energe[race]);
  damage:=dam;
  target:=nil;
  distance:=dist;
  time3:=ft;
  firetime:=time3;
  if tip=41 then begin
    spry:=-7;
  end;
  if tip in[26]
  then begin
    sizex:=32;
    sizey:=32;
    ramkax:=2;
    ramkay:=2;
  end;
  if tip in[28]
  then begin
{    sprx:=5;
    spry:=4;}
    ramkax:=2;
    ramkay:=3;
    sizex:=34;
    sizey:=34;
  end;
  if tip in[29]
  then begin
    sprx:=1;
    spry:=1;
    sizex:=36;
    sizey:=36;
{    damage:=50;
    time3:=40;
    firetime:=30;
    distance:=240+40;}
  end;

  if tip in[23,61]
  then begin
    sprx:=1;
    spry:=1;
    if tip=23
    then begin
      ramkay:=3;
      sprx:=1;
      spry:=1;
      sizex:=35;
      sizey:=35;
    end;
{    damage:=30;
    time3:=40;
    firetime:=30;
    distance:=240+120;}
  end;
  builder:=nil;
  kkk:=0;
  sxx:=0;syy:=0;
  if race=0 then color:=mycolor else color:=enemycolor;
  flagradar[0]:=true;
  flagradar[1]:=true;
  tipattack:=0;
  cloack:=false;
  flagcloack:=false;
  detector:=false;
  if tip in[40,70,71] then
  begin
    sizex:=37;sizey:=37;
    ramkay:=2;
  end;
  if tip in[41..42,71..72] then begin
    tipattack:=1;
    sizex:=37;
    sizey:=37;
    ramkay:=2;
    detector:=true;
  end;
  if tip in[41] then begin
    angletime:=time4;
    sizex:=40;sizey:=40;
    ramkay:=3;
  end;
  gr:=0;
  tiprocet:=4;
  if tip in[41,71]
  then tiprocet:=3;
  fillchar(gruppa,sizeOF(gruppa),false);
  sost:=3;
  repair:=nil;
  defenhouse:=defhouse;
  if defenhouse<>nil
  then defender:=true
  else defender:=false;
  sostWay:=sWay;
  if race=0 then sostWay:=5;
  if (sostWay<>255)and(race=1)
  then moving:=true;
  flagfff:=false;
  remont:=false;
  remontTime:=0;
  if tip=67
  then tipattack:=3;
  patr:=pat;
  if tip in[27]
  then begin
    energy:=100;
    Energy1:=100;
  end;
  chron[1]:=0;
  chron[2]:=0;
{  if (tip in[26])
  then begin
    cloack:=true;
    energy:=100;energy1:=200;
  end;}
end;

destructor tTank.done;
begin
  if (oldtip in[40..42])
  then begin
    dec(energe[race]);
{    newpanel[0]:=true;
    newpanel[1]:=true;}
  end;
  if (oldtip in[70..72]) then
    dec(energe[race]);
  inherited done;
end;

procedure tTank.show;
begin
  inherited show;
end;

begin
end.