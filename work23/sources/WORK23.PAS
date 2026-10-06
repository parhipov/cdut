{$A+,B-,D+,E+,F-,G-,I+,L+,N-,O-,P-,Q+,R+,S+,T-,V+,X+,Y+}
{$M 16384,0,655360}
program work;
uses crt,vx,objects,mouse,modul,objec,objec2,palitra,sbplay;
                  {111=kom centr
                   115=electr
                   112=refin
                   113=avia
                   114=tank}
const
  kolHelp=50;
type
    pStr=^tStr;
    tStr=object
            oldStr,Str:string[32];
            pos:byte;
            sezi:byte;
            flagShow:boolean;
            color,size:byte;
            time,time2:integer;
            masColor:array[1..17]of byte;
            sdvig:byte;
            constructor Init;
            destructor Done;
            procedure show;
            procedure readstr(event:tEvent);
            procedure showcurs;
           end;

    pStack=^tStack;
    tStack=object
            St:array[1..10]of byte;
            Top:integer;
            constructor Init;
            destructor Done;
            procedure save;
            procedure load2;
            function Pop:byte;
            procedure Push(x:byte);
           end;

    pMenu=^tMenu;
    tMenu=object(tObject)
      sost:byte;
      num:byte;{nomer stroki help'a}
      Mess:array [0..13] of string[37];
      MessHelp:array [0..kolHelp] of String[37];
      masFile:array[1..100]of string[32];
      kolFile:integer;
      num2:integer;
      flagStr:boolean;
      constructor init;
      destructor done;virtual;
      procedure HandleEvent(var Event:tEvent);virtual;
      procedure show;virtual;
      procedure save;virtual;
      procedure load2;virtual;
    end;

    pDeskTop=^tDeskTop;
    tDeskTop=object(tGroup)
      ScrollTime:integer;
      rasbuild,tipbuild:byte;
      otkogo:pObject;
      oldmousex,oldmousey:array[0..1] of integer;
      mousex1,mousey1,mousex2,mousey2:integer;
      flagbuildhouse,flagramka,FlagPressMouse:boolean;
      stB,stT,stA:pStack;
      flagBuildTank:boolean;
      flagBuildAir:boolean;
      timebuildH,tbuildH:integer;
      timebuildT,tbuildT:integer;
      timebuildA,tbuildA:integer;
      builder:pObject;
      xm2,ym2:integer;
      Arrow:byte;
      Vibor:boolean;
      Tarx,Tary:integer;
      FlagShowMove:boolean;{рисовать ли крест}
      TimeShowMove:byte;{time show krest}
      showMove:array[0..3]of integer;
      constructor Init;
      destructor Done;virtual;
      function putHouse(x1,y1,sx,sy,tp:integer):boolean;
      procedure panel(f:boolean);
      procedure putEvent(code:word);
      procedure show;virtual;
      procedure HandleEvent(var Event:tEvent);virtual;
      procedure run;
      procedure deletegroup;
      procedure CreateGroup(x1,y1,x2,y2:integer);
      procedure intellect;
      procedure showAll(f:byte);
      procedure show2;{show radar,menu and t.p.}
      procedure newOb(p:pObject;cod:word;zzz:integer);
      procedure createall;
      procedure save;virtual;
      procedure load2;virtual;
      procedure doneall;
      procedure done2(pp:pObject);
    end;

    pSmoke=^tSmoke;
    tSmoke=object(tObject)
      timeP:byte;
      constructor init(xx,yy:integer;tPh,tp:byte);
      constructor init2;
      destructor done;virtual;
      procedure HandleEvent(var Event:tEvent);virtual;
      procedure show;virtual;
      procedure save;virtual;
      procedure load2;virtual;
    end;

var
  quit:boolean;
  st:string;
  menu:pMenu;
  stroka:pStr;

{***********************Smoke************************}
procedure tSmoke.save;
begin
  inherited save;
  blockwrite(savefile,timep,sizeof(timep));
end;

procedure tSmoke.load2;
begin
  inherited load2;
  blockread(loadfile,timep,sizeof(timep));
end;

destructor tSmoke.done;
begin
  inherited done;
end;

constructor tSmoke.init(xx,yy:integer;tPh,tp:byte);
begin
  owner:=nil;elem:=nil;next:=nil;last:=nil;
  x:=xx;
  y:=yy;
  tip:=tp;
  angle:=0;
  timeP:=tPh;
  time3:=time10;
  timephase:=0;
end;

constructor tSmoke.init2;
begin
  owner:=nil;elem:=nil;next:=nil;last:=nil;
  time3:=time10;
  timephase:=0;
end;

procedure tSmoke.HandleEvent(var event:tEvent);
var event2:tEvent;
begin
  if (event.watch=cmEvent)and(event.code=cmFire)
  then begin
    modifpole2(x div 40,y div 40,1);
    if time3>0
    then dec(time3)
    else begin
      x:=x-1;
{      y:=y-1;}
      time3:=time10;
    end;
    if timePhase>0
    then dec(timePhase)
    else begin
      y:=y-1;
      timePhase:=timeP;
      inc(angle);
      if angle>7
      then begin
        event2.watch:=cmEvent;
        Event2.otkogo:=@self;
        event2.code:=cmDel;
        message(owner,event2);
        event2.watch:=cmNothing;
      end;
    end;
  end;
end;

procedure tSmoke.show;
begin
  if(x-polex*40>-20)and(x-polex*40<540)and(y-poley*40>-20)and(y-poley*40<500)
  and(angle<6) then putsprite(x-polex*40,y-poley*40,masSmoke[tip,angle]);
end;

{***************************************************************************}
procedure newowner(p,newow:pObject);
begin
  p^.owner:=newow;
  p^.select:=0;
end;

procedure PutH(lx,ly,x1,y1:integer;var x2,y2:integer;tB:integer;ff:boolean);
var i,j,ii,jj:integer;
    f:boolean;
begin
  if tB=122
  then begin
    x2:=-1;y2:=-1;
    for i:=maxx downto 0 do
      for j:=maxy downto 0 do
        if pole[i,j,0]=10
        then begin
          for ii:=i-6 to i+6 do
            for jj:=j-6 to j+6 do
              if (pole[ii,jj,0] in[70,71,121..126,201])or(ff)
              then begin
                x2:=i;
                y2:=j;
                exit;
              end;
        end;
    exit;
  end
  else begin
    repeat
      f:=false;
      ii:=integer(random(x2))-integer(random(x2))+x1;
      jj:=integer(random(y2))-integer(random(y2))+y1;
      for i:=ii-2 to ii+lx+2 do
        for j:=jj-2 to jj+ly+2 do
          if (i<0)or(j<0)or(i>maxx-lx-1)or(j>maxy-ly-1)
          or(pole[i,j,0]in[121,126,201,206,10,254,255,233])
          then begin
            f:=true;
          end;
    until not f;
    x2:=ii;
    y2:=jj;
  end;
end;

{*******************Stroka*******************}
constructor tStr.init;
var i:integer;
begin
  oldStr:='';
  pos:=0;
  flagShow:=true;
  size:=8;
  time2:=100;
  time:=time2;
  color:=yellow;
  for i:=1 to 17 do
    mascolor[i]:=90+i;
  sdvig:=0;
end;

destructor tStr.Done;
begin
end;

procedure tStr.show;
begin
  hidemouse;
  setcolor(100);
  bar(menux+26,menuy+16+20*(numFile),menux+25+(32)*size,menuy+12+20*(numFile+1));
  setcolor(91);
  outtextxy(menux+26,menuy+16+20*(numFile),fileStr);
{  setcolor(color);
  line(menux+26+(pos-1)*size,menuy+12+20*(numFile+1),menux+26+(pos)*size,menuy+12+20*(numFile+1));}
  flagShow:=false;
  showmouse;
end;

procedure tStr.showcurs;
var i,k:byte;
begin
  hidemouse;
  for i:=1 to 8 do
  begin
    k:=sdvig+i;
    if k>17 then k:=(k-17);
    setcolor(mascolor[k]);
{up-doun}
{    line(menux+25+(pos-1)*size,menuy-5+i+20*(numFile+1),
    menux+25+(pos)*size,menuy-5+i+20*(numFile+1));}
{left-right}
    line(menux+25+i+(pos-1)*size,menuy-4+20*(numFile+1),
    menux+25+i+(pos-1)*size,menuy+12+20*(numFile+1));
    if pos<=length(filestr)
    then begin
      setcolor(91);
      outtextxy(menux+26+(pos-1)*size,menuy+16+20*(numFile),fileStr[pos]);
    end;
  end;
  showmouse;
end;

procedure tStr.readStr(event:tEvent);
var s:string;
begin
  if time>0
  then dec(time)
  else begin
{    if color=100
    then color:=yellow
    else color:=100;}
    time:=time2;
    if sdvig>0
    then dec(sdvig)
    else sdvig:=17;
    showcurs;
{    hidemouse;
    setcolor(color);
    line(menux+26+(pos-1)*size,menuy+12+20*(numFile+1),menux+26+(pos)*size,menuy+12+20*(numFile+1));
    showmouse;}
  end;
  if (event.watch=cmKey)
  then begin
    case event.key of
      #0:begin
           oldStr:=fileStr;
           flagShow:=true;
           if pos>32 then pos:=32;
           if (filestr='          - пусто -')
           then begin
             fileStr:='';
           end;
           pos:=length(fileStr)+1;
         end;
      #27:begin
            FileStr:=oldStr;
            event.watch:=cmEvent;
            event.code:=cmNo;
            menu^.handleEvent(event);
            exit;
          end;
      #13:if fileStr<>''
          then begin
            event.watch:=cmEvent;
            event.code:=cmYes;
            menu^.handleEvent(event);
            exit;
          end;
      #75:if pos>1
          then begin
            hidemouse;
{            setcolor(100);
            line(menux+26+(pos-1)*size,menuy+12+20*(numFile+1),menux+26+(pos)*size,menuy+12+20*(numFile+1));}
            dec(pos);
            flagshow:=true;
{            setcolor(yellow);
            line(menux+26+(pos-1)*size,menuy+12+20*(numFile+1),menux+26+(pos)*size,menuy+12+20*(numFile+1));}
            showmouse;
            exit;
          end;
      #77:if (pos<length(fileStr)+1)and(pos<32)
          then begin
            hidemouse;
{            setcolor(100);
            line(menux+26+(pos-1)*size,menuy+12+20*(numFile+1),menux+26+(pos)*size,menuy+12+20*(numFile+1));}
            inc(pos);
            flagshow:=true;
{            setcolor(yellow);
            line(menux+26+(pos-1)*size,menuy+12+20*(numFile+1),menux+26+(pos)*size,menuy+12+20*(numFile+1));}
            showmouse;
            exit;
          end;
      #83:begin
            delete(fileStr,pos,1);
            flagShow:=true;
          end;
      #8:if pos>1 then begin
           delete(fileStr,pos-1,1);
           dec(pos);
           flagShow:=true;
         end;
      #71:begin
            pos:=1;
            flagShow:=true;
          end;
      #79:begin
            pos:=length(fileStr)+1;
            if pos>32 then pos:=32;
            flagShow:=true;
          end;
      'a'..'z','а'..'я','1'..'9',' ','-','_':
          if length(fileStr)<32
          then begin
            s:=event.key;
            insert(s,fileStr,pos);
            if pos<32 then inc(pos);
            flagShow:=true;
          end;
    end;
  end;
  if flagShow then show;
end;

{***********************Menu************************}
procedure tMenu.save;
begin
  blockwrite(savefile,sost,1);
  blockwrite(savefile,num,1);
end;

procedure tMenu.load2;
begin
  blockread(loadfile,sost,1);
  blockread(loadfile,num,1);
end;

destructor tMenu.done;
begin
  inherited done;
end;

constructor tMenu.init;
var s1,s2:string;
    f:file;
    i:integer;
begin
  inherited init;

  sost:=4;
  num:=0;
  num2:=1;
  numFile:=1;
  flagStr:=false;

  Mess[0]:='';
  Mess[1]:='';
  Mess[2]:='';
  Mess[3]:='  По вопросам распространения';
  Mess[4]:='    обращайтесь по телефону ';
  Mess[5]:='   55-16-46 - ';
  Mess[6]:='@              Архипов Павел.';
  Mess[7]:='Чтобы научиться писать подобные ';
  Mess[8]:=' программы, обращайтесь: ';
  Mess[9]:='@                         город';
  Mess[10]:='# Рыбинск, пр.Ленина 181 (ЦДЮТ),';
  Mess[11]:='#      4 этаж, кабинет 88';
  Mess[12]:='     E-Mail:';
  Mess[13]:='@             cdut@mail.ru';

  MessHelp[0]:='#         Цели и средства:';
  MessHelp[1]:='1. Постройте электростанцию, чтобы';
  MessHelp[2]:='   можно было создать завод для';
  MessHelp[3]:='   добычи ресурсов';
  MessHelp[4]:='2. Этот завод ставится только в';
  MessHelp[5]:='   специальной области';
  MessHelp[6]:='3. Стройте машинные заводы';
  MessHelp[7]:='4. Для обороны используйте пушки';
  MessHelp[8]:='5. Восстанавливайте поврежденную';
  MessHelp[9]:='   технику на специальной площадке';
  MessHelp[10]:='6. Для массированной атаки танки';
  MessHelp[11]:='   можно выделить в группу';
  MessHelp[12]:='7. Невидимки обладают свойством ';
  MessHelp[13]:='   невидимости только в том случае,';
  MessHelp[14]:='   если они не находятся в радиусе';
  MessHelp[15]:='   действия вражеской зенитки или';
  MessHelp[16]:='   детектора';
  MessHelp[17]:='8. "Chrono"танки могут моментально';
  MessHelp[18]:='   перемещаться в любое место';
  MessHelp[19]:='   игрового поля';
  MessHelp[20]:='9. Стройте воздушные транспорты';
  MessHelp[21]:='   для быстрой доставки танков';
  MessHelp[22]:='   к месту боевых действий';
  MessHelp[23]:='10.Управление стандартное';
  MessHelp[24]:='11.С помощью клавиши Shift можно';
  MessHelp[25]:='   добавить один танк в группу';
  MessHelp[26]:='   выбранных, не отказываясь при';
  MessHelp[27]:='   этом от остальных объектов, или';
  MessHelp[28]:='   отказаться от выбора только';
  MessHelp[29]:='   одного объекта';
  MessHelp[30]:='12.Чтобы выбрать все видимые на';
  MessHelp[31]:='   экране объекты нажмите "E"';
  MessHelp[32]:='13."R"-отказаться от всей группы';
  MessHelp[33]:='14."C"-скрывание (для невидимок)';
  MessHelp[34]:='15.Можно сохранить до 10 выбранных';
  MessHelp[35]:='   групп, нажав Shift и "0"-"9"';
  MessHelp[36]:='16.Вражеские структуры на радаре';
  MessHelp[37]:='   изображаются красным цветом,';
  MessHelp[38]:='   свои-зеленым, ресурсы-голубым';
  MessHelp[39]:='17.Чтобы попасть в нужное место';
  MessHelp[40]:='   игрового поля нажмите левую';
  MessHelp[41]:='   кнопку мыши на экране радара';
  MessHelp[42]:='18.Скроллинг,передвижение и ремонт';
  MessHelp[43]:='   сопровождаются различными';
  MessHelp[44]:='   курсорами мыши';
  MessHelp[45]:='19.Опасайтесь скрытых самолетов';
  MessHelp[46]:='   противника!';
  MessHelp[47]:='20.Ни в коем случае не разрешайте ';
  MessHelp[48]:='   компьютеру захватывать ресурсы!';
  MessHelp[49]:='   ';
  MessHelp[50]:='#           Желаю удачи!';

  for i:=1 to 12 do
    masfile[i]:='';
  {$I-}
  kolFile:=1;
  repeat
    s1:='save';
    str(kolFile,s2);
    s1:=s1+s2+'.sav';
    assign(f,s1);
    reset(f,1);
    blockread(f,masFile[kolfile],sizeof(masFile[kolFile]));
    inc(kolFile);
    close(f);
  until IOResult<>0;
  {$I+}
   kolFile:=kolFile-2;
   if Kolfile<12
   then masFile[kolFile+1]:='          - пусто -';
end;

procedure tMenu.show;
var hand:word;
    k,i,j:integer;
    s:string;
begin
  hidemouse;
{  drawWindow(menux,menuy,menux2,menuy2,hand);
  putsprite(menux+80,menuy+145,houses[111,0]);}
  if (sost<>7)and(sost<>9)
  then showWindow(menux,menuy,menux2,menuy2,hand);
  case sost of
    0:begin
        drawButton(menux+20,menuy+20,menux2-20,menuy+40,'Помощь',false,false);
        drawButton(menux+20,menuy+20+25*1,menux2-20,menuy+40+25*1,'Информация',false,false);
        drawButton(menux+20,menuy+20+25*2,menux2-20,menuy+40+25*2,'Загрузить',false,false);
        drawButton(menux+20,menuy+20+25*3,menux2-20,menuy+40+25*3,'Сохранить',false,false);
        drawButton(menux+20,menuy+20+25*4,menux2-20,menuy+40+25*4,'Перезапуск',false,false);
        drawButton(menux+20,menuy+20+25*5,menux2-20,menuy+40+25*5,'Продолжить',false,false);
        drawButton(menux+20,menuy+20+25*6,menux2-20,menuy+40+25*6,'Выход',false,false);
        drawButton(menux+20,menuy2-55,menux2-20,menuy2-35,'ЦДЮТ',true,false);
        drawButton(menux+20,menuy2-35,menux2-20,menuy2-15,'2000 год',true,false);
        putsprite(menux+((menux2-menux)div 2)-16,menuy+240,pict[5]);
      end;
    1:begin
        setcolor(122{95});
        BorlandOutTextXY(menux+50,menuy+35,'Операция "Ы"',GothP);
        setcolor(125{100});
        OutTextXY(menux+72+10,menuy+47,'Рыбинск, 2000 год');

        i:=0;j:=0;
        while i<=13 do
        begin
          s:=mess[i];
          if mess[i][1]='@'
          then begin
            k:=91;
            delete(s,1,1);
          end
          else begin
            if mess[i][1] in['#']
            then begin
              k:=91;
              delete(s,1,1);
              inc(j);
            end
            else begin
              k:=95;
              inc(j);
            end;
          end;
          setcolor(110);
          outtextxy(menux+17+8,menuy+15+20*(j-1),s);
          setcolor({lightgreen}k);
          outtextxy(menux+17+1+8,menuy+15+20*(j-1)+1,s);
          inc(i);
        end;
        line(menux+130,menuy+31+20*(j-1),menux+225,menuy+31+20*(j-1));
        putsprite(menux+((menux2-menux)div 2)-16,menuy+245,pict[5]);
        drawButton(menux+20,menuy2-45,menux2-20,menuy2-25,'Продолжить',false,false);
      end;
    2:begin
        if num+12<=kolHelp
        then j:=num+12
        else j:=kolHelp;
        for i:=num to j do
        begin
          k:=95;
          s:=messHelp[i];
          if s[1]='#'
          then begin
            k:=92;
            delete(s,1,1);
          end;
          setcolor(110);
          outtextxy(menux+15,menuy+15+18*(i-num),s);
          setColor(k);
          outtextxy(menux+15+1,menuy+15+18*(i-num)+1,s);
        end;
        putsprite(menux+((menux2-menux)div 2)-16,menuy+260,pict[5]);
        drawButton(menux+20,menuy2-45,menux2-20,menuy2-25,'Продолжить',false,false);
        if num>=12 then drawButton(menux+20,menuy2-75,menux+105,menuy2-55,'Назад',false,false);
        if num+12<kolHelp then drawButton(menux2-105,menuy2-75,menux2-20,menuy2-55,'Вперед',false,false);
      end;
    4:begin
        borlandSetTextSize(1);
{        setcolor(green);
        BorlandOutTextXY(menux+20+1,menuy+40+1,'Центр Детского',GothP);
        BorlandOutTextXY(menux+130+1,menuy+70+1,'и',GothP);
        BorlandOutTextXY(menux+55+1,menuy+100+1,'Юношеского',GothP);
        BorlandOutTextXY(menux+65+1,menuy+130+1,'Творчества',GothP);
        BorlandOutTextXY(menux+40+1,menuy+200+1,'Операция "Ы"',GothP);}
        setcolor(125);
        BorlandOutTextXY(menux+20+10,menuy+40,'Центр Детского',GothP);
        BorlandOutTextXY(menux+130+10,menuy+70,'и',GothP);
        BorlandOutTextXY(menux+55+10,menuy+100,'Юношеского',GothP);
        BorlandOutTextXY(menux+65+10,menuy+130,'Творчества',GothP);
        setcolor(119);
        BorlandOutTextXY(menux+40+10,menuy+180,'Операция "Ы"',GothP);
        setcolor(127);
        OutTextXY(menux+72+10,menuy+220+10,'Рыбинск, 2000 год');

        putsprite(menux+((menux2-menux)div 2)-16,menuy+250,pict[5]);
        drawButton(menux+20,menuy2-45,menux2-20,menuy2-25,'Продолжить',false,false);
      end;
    6:begin
        setcolor(119);
        OutTextXY(menux+50,menuy+15,'Выберите файл для загрузки');
        j:=kolFile;
        for i:=num2 to j do
        begin
          if numFile=i then putsprite(menux+15-2,menuy+18+20*(i-num2+1)+1,pict[17])
          else putsprite(menux+15-2,menuy+18+20*(i-num2+1)+1,pict[16]);
          if numFile=i then setColor(91) else setColor(95);
          outtextxy(menux+25+1,menuy+15+20*(i-num2+1)+1,masFile[i]);
        end;

{        putsprite(menux+((menux2-menux)div 2)-16,menuy+260,pict[5]);}
        drawButton(menux+20,menuy2-60,menux2-20,menuy2-40,'Загрузить',false,false);
        drawButton(menux+20,menuy2-36,menux2-20,menuy2-16,'Отмена',false,false);
(*        {if num2>=12 then }drawButton(menux+20,menuy2-36,menux+85,menuy2-16,'Назад',false,false);
        {if num2+12<kolFile then }drawButton(menux2-85,menuy2-36,menux2-20,menuy2-16,'Вперед',false,false);*)
      end;
    7:begin
        j:=kolFile;
        for i:=num2 to j do
        begin
          if numFile=i then putsprite(menux+15-2,menuy+18+20*(i-num2+1)+1,pict[17])
          else putsprite(menux+15-2,menuy+18+20*(i-num2+1)+1,pict[16]);
          if numFile=i then setColor(91) else setColor(95);
          outtextxy(menux+25+1,menuy+15+20*(i-num2+1)+1,masFile[i]);
        end;
        sost:=6;
      end;
    8:begin
        setcolor(119);
        OutTextXY(menux+40,menuy+15,'Выберите файл для сохранения');
        if kolFile+1<12 then j:=kolFile+1
        else j:=12;
        for i:=num2 to j do
        begin
          if numFile=i then putsprite(menux+15-2,menuy+18+20*(i-num2+1)+1,pict[17])
          else putsprite(menux+15-2,menuy+18+20*(i-num2+1)+1,pict[16]);
          if numFile=i then setColor(91) else setColor(95);
          outtextxy(menux+25+1,menuy+15+20*(i-num2+1)+1,masFile[i]);
        end;
        drawButton(menux+20,menuy2-60,menux2-20,menuy2-40,'Сохранить',false,false);
        drawButton(menux+20,menuy2-36,menux2-20,menuy2-16,'Отмена',false,false);
      end;
    9:begin
        if kolFile+1<12 then j:=kolFile+1
        else j:=12;
        for i:=num2 to j do
        begin
          if numFile=i then putsprite(menux+15-2,menuy+18+20*(i-num2+1)+1,pict[17])
          else putsprite(menux+15-2,menuy+18+20*(i-num2+1)+1,pict[16]);
          if numFile=i then setColor(91) else setColor(95);
          outtextxy(menux+25+1,menuy+15+20*(i-num2+1)+1,masFile[i]);
        end;
        sost:=8;
      end;
  end;
  showmouse;
end;

procedure tMenu.HandleEvent(var Event:tEvent);
var hand:word;
    f:file;
    s1,s2:string;
    i,j:integer;
begin
  if flagStr
  then begin
    if (event.watch=cmEvent)
    then begin
      case event.code of
        cmNo:begin
               flagStr:=false;
               sost:=8;
               newMenu[0]:=true;
             end;
        cmYes:begin
                sost:=0;
                newMenu[0]:=true;
                flagStr:=false;
                str(numFile,s1);
                fileName:='save'+s1+'.sav';
                desk^.save;
              end;
      end;
    end;
    stroka^.readStr(event);
    exit;
  end;

  if (event.watch=cmEvent)
  then begin
    if event.code=cmRestore
    then begin
      num2:=1;
      numFile:=1;
      for i:=1 to 12 do
        masfile[i]:='';
      {$I-}
      kolFile:=1;
      repeat
        s1:='save';
        str(kolFile,s2);
        s1:=s1+s2+'.sav';
        assign(f,s1);
        reset(f,1);
        blockread(f,masFile[kolfile],sizeof(masFile[kolFile]));
        inc(kolFile);
        close(f);
      until IOResult<>0;
      {$I+}
       kolFile:=kolFile-2;
       if Kolfile<12
       then masFile[kolFile+1]:='          - пусто -';
    end;
  end;
  if (event.watch=cmKey)
  then begin
    case event.key of
      #72:begin
            if sost in[6,8]
            then begin
              if numFile>1
              then begin
                dec(numFile);
                newmenu[0]:=true;
                if sost=8 then sost:=9;
                if sost=6 then sost:=7;
              end;
            end;
          end;
      #80:begin
            if sost in[6,8]
            then begin
              if ((numFile<kolFile)and(sost=6))
              or((sost=8)and(numFile<kolFile+1)and(numFile<12))
              then begin
                inc(numFile);
                newmenu[0]:=true;
                if sost=8 then sost:=9;
                if sost=6 then sost:=7;
              end;
            end;
          end;
      #13:begin
            if sost=4
            then begin
              play('wav2.wav');
              flagMenu:=false;
              sost:=0;
              pereris[0]:=true;
              pereris[1]:=true;
              cursor:=oldCursor;
              setCursor(cursor);
            end;
            if sost=6
            then begin
              hidemouse;
              drawButton(menux+20,menuy2-60,menux2-20,menuy2-40,'Загрузить',true,false);
              showmouse;
              play('wav2.wav');
              delay(100);
              str(numFile,s1);
              fileName:='save'+s1+'.sav';
              desk^.load2;
            end;
            if (sost=8)and(numFile<=12)
            then begin
              fileStr:=masFile[numFile];
              event.watch:=cmKey;
              event.key:=#0;
              stroka^.readstr(event);
              flagStr:=true;
              hidemouse;
              drawButton(menux+20,menuy2-60,menux2-20,menuy2-40,'Сохранить',true,false);
              showmouse;
              play('wav2.wav');
            end;
          end;
      #27:begin
            play('wav2.wav');
            if sost<>0
            then begin
              if sost<>4
              then newMenu[0]:=true
              else begin
                flagMenu:=false;
                pereris[0]:=true;
                pereris[1]:=true;
                cursor:=oldCursor;
                setCursor(cursor);
              end;
              sost:=0;
            end
            else begin
              flagMenu:=false;
              pereris[0]:=true;
              pereris[1]:=true;
              cursor:=oldCursor;
              setCursor(cursor);
              if pDeskTop(desk)^.arrow<>0 then hidemouse;
            end;
          end;
      'q','Q','й','Й':if event.key<>#81
         then begin
            flagQuit:=true;
            quit:=true;
          end;
    end;
  end;
  if (event.watch=cmMouse)and(event.button=1)
  then begin
    case sost of
      0:begin
          if (event.xm>menux+20)and(event.xm<menux2-20)and
          (event.ym>menuy+20+25*2)and(event.ym<menuy+40+25*2)
          then begin
            hidemouse;
            drawButton(menux+20,menuy+20+25*2,menux2-20,menuy+40+25*2,'Загрузить',true,false);
            showmouse;
            play('wav1.wav');
            delay(100);
            hidemouse;
            drawButton(menux+20,menuy+20+25*2,menux2-20,menuy+40+25*2,'Загрузить',false,false);
            showmouse;
{            pDeskTop(desk)^.load2;}
            flagmenu:=true;
            newmenu[0]:=true;
            sost:=6;
            newmenu[0]:=true;
          end;
          if (event.xm>menux+20)and(event.xm<menux2-20)and
          (event.ym>menuy+20+25*3)and(event.ym<menuy+40+25*3)
          then begin
            hidemouse;
            drawButton(menux+20,menuy+20+25*3,menux2-20,menuy+40+25*3,'Сохранить',true,false);
            showmouse;
            play('wav1.wav');
            delay(100);
            hidemouse;
            drawButton(menux+20,menuy+20+25*3,menux2-20,menuy+40+25*3,'Сохранить',false,false);
            showmouse;
{            pDeskTop(desk)^.save;}
            sost:=8;
            newmenu[0]:=true;
          end;
          if (event.xm>menux+20)and(event.xm<menux2-20)and
          (event.ym>menuy+20+25*6)and(event.ym<menuy+40+25*6)
          then begin
{            flagQuit:=true;}
            sost:=3;
            hidemouse;
            drawButton(menux+20,menuy+20+25*6,menux2-20,menuy+40+25*6,'Выход',true,false);
            showmouse;
            play('wav3.wav');
            delay(100);
            hidemouse;
            showWindow(menux+20,menuy+190,menux2-20,menuy+280,hand);
            setcolor(110);
            outtextxy(menux+20+80,menuy+163+40,'Вы уверены?');
            setcolor({lightgreen}95);
            outtextxy(menux+20+1+80,menuy+163+40+1,'Вы уверены?');
            drawButton(menux+20+60,menuy+263-20,menux+20+110,menuy+263-0,'Да',false,false);
            drawButton(menux+20+140,menuy+263-20,menux+20+190,menuy+263-0,'Нет',false,false);
            showmouse;
          end;
          if (event.xm>menux+20)and(event.xm<menux2-20)and
          (event.ym>menuy+20+25*4)and(event.ym<menuy+40+25*4)
          then begin
            sost:=5;
            hidemouse;
            drawButton(menux+20,menuy+20+25*4,menux2-20,menuy+40+25*4,'Перезапуск',true,false);
            showmouse;
            play('wav1.wav');
            delay(100);
            showWindow(menux+20,menuy+190,menux2-20,menuy+280,hand);
            setcolor(110);
            outtextxy(menux+20+80,menuy+163+40,'Начать сначала?');
            setcolor({lightgreen}95);
            hidemouse;
            outtextxy(menux+20+65,menuy+163+40,'Начать сначала?');
            drawButton(menux+20+60,menuy+263-20,menux+20+110,menuy+263-0,'Да',false,false);
            drawButton(menux+20+140,menuy+263-20,menux+20+190,menuy+263-0,'Нет',false,false);
            showmouse;
          end;
          if (event.xm>menux+20)and(event.xm<menux2-20)and
          (event.ym>menuy+20+25*5)and(event.ym<menuy+40+25*5)
          then begin
            flagMenu:=false;
            pereris[0]:=true;
            pereris[1]:=true;
            hidemouse;
            drawButton(menux+20,menuy+20+25*5,menux2-20,menuy+40+25*5,'Продолжить',true,false);
            showmouse;
            play('wav1.wav');
            delay(100);
            cursor:=oldCursor;
            setCursor(cursor);
          end;
          if (event.xm>menux+20)and(event.xm<menux2-20)and
          (event.ym>menuy+20+25*1)and(event.ym<menuy+40+25*1)
          then begin
            sost:=1;
            newMenu[0]:=true;
            hidemouse;
            drawButton(menux+20,menuy+20+25*1,menux2-20,menuy+40+25*1,'Информация',true,false);
            showmouse;
            play('wav1.wav');
            delay(100);
          end;
          if (event.xm>menux+20)and(event.xm<menux2-20)and
          (event.ym>menuy+20)and(event.ym<menuy+40)
          then begin
            sost:=2;
            newMenu[0]:=true;
            hidemouse;
            drawButton(menux+20,menuy+20,menux2-20,menuy+40,'Помощь',true,false);
            showmouse;
            play('wav1.wav');
            delay(100);
          end;
      end;
      1:begin
          if (event.xm>menux+20)and(event.xm<menux2-20)and
          (event.ym>menuy2-45)and(event.ym<menuy2-25)
          then begin
            sost:=0;
            newMenu[0]:=true;
            hidemouse;
            drawButton(menux+20,menuy2-45,menux2-20,menuy2-25,'Продолжить',true,false);
            showmouse;
            play('wav2.wav');
            delay(100);
          end;
        end;
      2:begin
          if (num>=13)and(event.xm>menux+20)and(event.xm<menux+105)
          and(event.ym>menuy2-75)and(event.ym<menuy2-55)
          then begin
            num:=num-13;
            newMenu[0]:=true;
            hidemouse;
            drawButton(menux+20,menuy2-75,menux+105,menuy2-55,'Назад',true,false);
            showmouse;
            play('wav2.wav');
            delay(150);
          end;
         if (num+13<kolHelp)and(event.xm>menux2-105)and(event.xm<menux2-20)
          and(event.ym>menuy2-75)and(event.ym<menuy2-55)
          then begin
            num:=num+13;
            newMenu[0]:=true;
            hidemouse;
            drawButton(menux2-105,menuy2-75,menux2-20,menuy2-55,'Вперед',true,false);
            showmouse;
            play('wav2.wav');
            delay(150);
          end;
          if (event.xm>menux+20)and(event.xm<menux2-20)and
          (event.ym>menuy2-45)and(event.ym<menuy2-25)
          then begin
            sost:=0;
            newMenu[0]:=true;
            hidemouse;
            drawButton(menux+20,menuy2-45,menux2-20,menuy2-25,'Продолжить',true,false);
            showmouse;
            play('wav2.wav');
            delay(100);
          end;
        end;
      3:begin
          if (event.xm>menux+20+60)and(event.xm<menux+20+110)and
          (event.ym>menuy+263-20)and(event.ym<menuy+263-0)
          then begin
            flagQuit:=true;
            quit:=true;
            hidemouse;
            drawButton(menux+20+60,menuy+263-20,menux+20+110,menuy+263-0,'Да',true,false);
            showmouse;
            play('wav2.wav');
            repeat
            until EndingPlay
          end;
          if (event.xm>menux+20+140)and(event.xm<menux+20+190)and
          (event.ym>menuy+263-20)and(event.ym<menuy+263-0)
          then begin
            sost:=0;
{            flagmenu:=false;}
            newMenu[0]:=true;
            hidemouse;
            drawButton(menux+20+140,menuy+263-20,menux+20+190,menuy+263-0,'Нет',true,false);
            showmouse;
            play('wav2.wav');
            delay(100);
          end;
        end;
      4:begin
          if (event.xm>menux+20)and(event.xm<menux2-20)and
          (event.ym>menuy2-45)and(event.ym<menuy2-25)
          then begin
            sost:=0;
            flagMenu:=false;
            pereris[0]:=true;
            pereris[1]:=true;
            hidemouse;
            drawButton(menux+20,menuy2-45,menux2-20,menuy2-25,'Продолжить',true,false);
            showmouse;
            play('wav2.wav');
            delay(100);
            cursor:=oldCursor;
            setCursor(cursor);
          end;
        end;
      5:begin
          if (event.xm>menux+20+60)and(event.xm<menux+20+110)and
          (event.ym>menuy+263-20)and(event.ym<menuy+263-0)
          then begin
            flagQuit:=true;
            quit:=false;
            hidemouse;
            drawButton(menux+20+60,menuy+263-20,menux+20+110,menuy+263-0,'Да',true,false);
            showmouse;
            play('wav2.wav');
            delay(100);
          end;
          if (event.xm>menux+20+140)and(event.xm<menux+20+190)and
          (event.ym>menuy+263-20)and(event.ym<menuy+263-0)
          then begin
            sost:=0;
{            flagmenu:=false;}
            newMenu[0]:=true;
            hidemouse;
            drawButton(menux+20+140,menuy+263-20,menux+20+190,menuy+263-0,'Нет',true,false);
            showmouse;
            play('wav2.wav');
            delay(100);
          end;
        end;
      6,8:begin
          if (event.xm>menux+20)and(event.xm<menux2-20)
          and(event.ym>menuy2-36)and(event.ym<menuy2-16)
          then begin
            hidemouse;
            drawButton(menux+20,menuy2-36,menux2-20,menuy2-16,'Отмена',true,false);
            showmouse;
            play('wav2.wav');
            delay(100);
            sost:=0;
            newMenu[0]:=true;
            exit;
          end;
          if (event.xm>menux+20)and(event.xm<menux2-20)
          and(event.ym>menuy2-60)and(event.ym<menuy2-40)
          then begin
            hidemouse;
            if sost=6 then drawButton(menux+20,menuy2-60,menux2-20,menuy2-40,'Загрузить',true,false);
            if sost=8 then drawButton(menux+20,menuy2-60,menux2-20,menuy2-40,'Сохранить',true,false);
            showmouse;
            play('wav2.wav');
            delay(100);
            if sost=6
            then begin
              if kolFile>0
              then begin
                str(numFile,s1);
                fileName:='save'+s1+'.sav';
                desk^.load2;
                exit;
              end
              else begin
                sost:=0;
                newMenu[0]:=true;
                exit;
              end;
            end;
            if sost=8
            then begin
              fileStr:=masFile[numFile];
              event.watch:=cmKey;
              event.key:=#0;
              stroka^.readstr(event);
              flagStr:=true;
              exit;
            end;
          end;
          if sost=6 then j:=kolFile;
          if sost=8
          then begin
            if kolFile+1<13 then j:=kolFile+1
            else j:=kolFile;
          end;
          if sost in[6,8] then
          begin
            for i:=1 to j do
            begin
              if (event.xm>menux+5)and(event.xm<menux2-5)
              and(event.ym>menuy+15+20*(i-num2+1)+1)
              and(event.ym<menuy+15+20*(i-num2+2)+1)
              then begin
                numFile:=i;
                newmenu[0]:=true;
                if sost=6 then sost:=7;
                if sost=8 then sost:=9;
                exit;
              end;
            end;
          end;
        end;
    end
  end;
end;

{***************************Stack*************************************}
procedure tStack.save;
begin
  blockwrite(savefile,st,sizeof(st));
  blockwrite(savefile,top,sizeof(top));
end;

procedure tStack.load2;
begin
  blockread(loadfile,st,sizeof(st));
  blockread(loadfile,top,sizeof(top));
end;

constructor tStack.init;
begin
{  new(st);}
  top:=0;
end;

destructor tStack.Done;
begin
{  dispose(st);}
end;

function tStack.Pop:byte;
begin
  if top>0
  then begin
    pop:=st[top];
    dec(top);
  end
  else begin
    sound(1000);
    delay(1000);
    nosound;
  end;
end;

procedure tStack.Push(x:byte);
begin
  inc(top);
  st[top]:=x;
end;
{***************************DeskTop*********************************}
procedure tdeskTop.show2;
var hand:word;
begin
  newpanel[0]:=true;
  newpanel[1]:=true;
  page:=0;
{  setwsize(0,0,520,480);}
  setwsize(0,0,640,480);
  hidemouse;
  setvisualpage(page);
  setactivepage(1-page);
  showall(1);
  drawWindow(520,0,640,radary+maxy+15,hand);
  drawWindow(520,radary+maxy+16,640,480,hand);
  setcolor(diedcolor);
  bar(radarx,radary,radarx+maxx,radary+maxy);
  radar;
  radar2;
  rectangle(radarx-1,radary-1,radarx+maxx+1,radary+maxy+1,0,0);
{  putevent(cmRadar);}
{  panel;}
  page:=1-page;
  setvisualpage(page);
  setactivepage(1-page);
  showall(1);
  drawWindow(520,0,640,radary+maxy+15,hand);
  drawWindow(520,radary+maxy+16,640,480,hand);
  setcolor(diedcolor);
  bar(radarx,radary,radarx+maxx,radary+maxy);
  radar;
  radar2;
  rectangle(radarx-1,radary-1,radarx+maxx+1,radary+maxy+1,0,0);
{  putevent(cmRadar);}
{  panel;}
  setwsize(0,0,520,480);
{  newpanel[0]:=true;
  newpanel[1]:=true;}
  showmouse;
  showmouse;
{  showAll:=false;}
    setactivepage(1);
end;

procedure tDeskTop.intellect;
var i:integer;
    xx,yy:integer;
    event2:tEvent;

procedure createbuild;
var target:pointer;
begin
  case sostB of
    0:begin
        i:=120;
        while not((numberBuild[i]<maxBuild[i])and(masFlagBuild[i])) do
        begin
          inc(i);
          if i>126
          then begin
            sostB:=3;
            exit;
          end;
        end;
        if i<>120
        then begin
          if money[1]>=masCoast[i]
          then begin
            money[1]:=money[1]-masCoast[i];
            stb^.push(2);
            tbuildH:=i;
            timebuildH:=mastimebuild[tBuildH];
            sostB:=1;
          end;
        end
        else
          sostB:=3;
        if not construction
        then sostB:=5;
      end;
    1:begin
        if TimeBuildH>0 then dec(TimeBuildH)
        else sostB:=stb^.pop;
      end;
    2:begin
        xx:=25;yy:=25;
        putH(massize[tbuildH,0],massize[tbuildH,1],80,80,xx,yy,tBuildH,false);
        if (xx>0)and(yy>0)
        then pdesktop(enemyhouse)^.insert(new(phouse,Init(xx,yy,massize[tbuildH,0],
             massize[tbuildH,1],tbuildH,1,maspow[tbuildH],maspow[tbuildH])));
        inc(numberbuild[tbuildH]);
        sostb:=0;
        case tbuildH of
          125:begin
                masflagbuild[122]:=true;
              end;
          122:begin
                masflagbuild[124]:=true;
              end;
          124:begin
                masflagbuild[123]:=true;
                flagBuildTank:=true;
              end;
          123:begin
                flagBuildAir:=true;
              end;
        end;
      end;
    3:begin
        if not construction
        then begin
          sostB:=5;
          exit;
        end;
        event2.watch:=cmEvent;
        event2.code:=cmTurret;
        event2.otkogo:=nil;
        message(enemyhouse,event2);
        if event2.otkogo<>nil
        then begin
          if money[1]>=masCoast[event2.tip]
          then begin
            money[1]:=money[1]-masCoast[event2.tip];
            stb^.push(4);
            tbuildH:=event2.tip;
            timebuildH:=masTimeBuild[tBuildH];
            builder:=event2.otkogo;
            sostB:=1;
          end;
        end
        else
          sostB:=5;
      end;
    4:begin
        event2.watch:=cmEvent;
        event2.code:=cmPutTurret;
        event2.tip:=tBuildH;
        message(builder,event2);
        builder:=nil;
        sostB:=3;
      end;
    5:begin
        if(memAvail<20000)
        then begin
          sostB:=8;
          exit;
        end;
        if (complet)and(not zahvat)and(not attack)
        and(koltank=0)and(kolAir=0)and(flag67)
        and(not patrol[0])and(not patrol[1])
        then begin
          koltank:=koltank+incKol[0];
          kolAir:=kolAir+incKol[1];
          if (random(100)>prioritet)or(noTiberium)
          then begin
{            attack:=true;}
            sostB:=8;
          end
          else begin
{            flag67:=false;}
            zahvat:=true;
            complet:=false;
          end;
        end;
        if (zahvat)and(not noTiberium)
        then begin
          sostB:=6;
          flagTiberium:=0;
        end;
        if (not noTiberium)and(flagTiberium=5)and(zahvat)
        then begin
          sostB:=0;
          flagtiberium:=1;
        end;
        if (zahvat)and(noTiberium)
        then begin
          zahvat:=false;
          complet:=true;
        end;
      end;
    6:begin
        xx:=0;yy:=0;
        putH(massize[tbuildH,0],massize[tbuildH,1],80,80,xx,yy,122,true);
        if (xx<0)and(yy<0)then
        noTiberium:=true;
        if (xx<>0)and(yy<>0)and(not noTiberium)
        then begin
          event2.watch:=cmEvent;
          event2.code:=cmNewGo2;
          event2.newx:=xx;
          event2.newy:=yy;
          message(enemytank,event2);
          message(enemyAir,event2);
          flagTiberium:=1;
{          flag67:=false;}
          zahvat:=false;
          sostB:=5;
        end
        else begin
{          zahvat:=true;}
          sostB:=5;
        end;
      end;
    7:begin
        xx:=0;yy:=0;
        putH(massize[tbuildH,0],massize[tbuildH,1],80,80,xx,yy,122,false);
        if (xx>0)and(yy>0)
        then begin
          inc(maxbuild[122]);
          sostB:=0;
        end;
      end;
    8:begin
        if (random(2)>0)
        then begin
          target:=seekTarget2(xx,yy,0);
          if target<>nil
          then begin
            tarx:=xx;tary:=yy;
            event2.watch:=cmEvent;
            event2.code:=cmAttack4;
            event2.x:=xx;
            event2.y:=yy;
            event2.ground:=0;
            message(enemytank,event2);
            message(enemyAir,event2);
          end;
          sostB:=5;
        end
        else begin
        end;
      end;
  end;
end;

procedure createTank;
var i,j,xx,yy:integer;
begin
  case sostT of
    0:begin
        if (kolpatrol[0]>0)and(patrol[0])
        then begin
          tBuildT:=60+random(4);
          if money[1]>=masCoast[tBuildT]
          then begin
            money[1]:=money[1]-masCoast[tBuildT];
            timebuildT:=mastimebuild[tBuildT];
            stT^.push(2);
            sostT:=1;
          end
        end
        else begin
          if (kolTank>0){or((koltank>0)and(flag67))}
          then begin
            tBuildT:=60+random(4);
            if money[1]>=masCoast[tBuildT]
            then begin
              money[1]:=money[1]-masCoast[tBuildT];
              timebuildT:=mastimebuild[tBuildT];
              stT^.push(2);
              sostT:=1;
            end
          end
          else
            if{(koltank>0)and}(not flag67)
            then begin
              tBuildT:=67;
              if money[1]>=masCoast[tBuildT]
              then begin
                money[1]:=money[1]-masCoast[tBuildT];
                timebuildT:=10;
                stT^.push(2);
                sostT:=1;
              end
            end;
        end;
      end;
    1:begin
        if TimeBuildT>0 then dec(TimeBuildT)
        else sostT:=stT^.pop;
      end;
    2:begin
        event2.watch:=cmEvent;
        event2.code:=cmWho3;
        event2.pow:=0;
        event2.tip:=124;
        message(enemyhouse,event2);
        if (event2.pow=cmItIsWho)and(memAvail>20000)
        then begin
          for i:=event2.x-1 to event2.x+event2.sx do
            for j:=event2.y-1 to event2.y+event2.sy do
              if (i>=0)and(j>=0)and(i<=maxx)and(j<=maxy)
              and(pole[i,j,0] in[0,3,4]) then
              begin
                if patrol[0]
                then begin
                  pGroup(enemyTank)^.insert(new(pTank,init(i,j,i,j,i,j,0,0,
                  masPow[tBuildT],maspow[tBuildT],1,0,tBuildT,1,32,32,2,0,false,0,0,
                  masDis[tBuildT],masdam[tbuildT],masTime[tBuildT],nil,0,true)));
                  dec(kolPatrol[0]);
                  if kolpatrol[0]=0
                  then patrol[0]:=false;
                  sostT:=0;
                  exit;
                end
                else begin
                  if tBuildT<>67
                  then begin
                    dec(KolTank);
                    event2.otkogo:=nil;
                    event2.x:=i;
                    event2.y:=j;
                    event2.watch:=cmEvent;
                    event2.code:=cmNewDefen;
                    event2.pow:=0;
                    message(enemyhouse,event2);
                    if event2.otkogo<>nil
                    then begin
                      pGroup(enemyTank)^.insert(new(pTank,init(i,j,event2.x,event2.y,i,j,0,0,
                      masPow[tBuildT],maspow[tBuildT],1,0,tBuildT,1,32,32,2,0,false,0,0,
                      masDis[tBuildT],masdam[tbuildT],masTime[tBuildT],event2.otkogo,255,false)))
                    end
                    else begin
                      pGroup(enemyTank)^.insert(new(pTank,init(i,j,event2.x,event2.y,i,j,0,0,
                      masPow[tBuildT],maspow[tBuildT],1,0,tBuildT,1,32,32,2,0,false,0,0,
                      masDis[tBuildT],masdam[tbuildT],masTime[tBuildT],nil,0,false)))
                    end
                  end
                  else begin
                    pGroup(enemyTank)^.insert(new(pTank,init(i,j,i,j,i,j,0,0,
                    masPow[tBuildT],maspow[tBuildT],1,0,tBuildT,1,32,32,3,0,false,0,0,
                    masDis[tBuildT],masdam[tbuildT],masTime[tBuildT],nil,255,false)));
                    flag67:=true;
                  end;
                end;
                sostT:=0;
                exit;
              end;
        end
        else begin
        end;
      end;
  end;
end;

procedure createAir;
var i,j,xx,yy:integer;
begin
  case sostA of
    0:begin
        if (kolAir>0)or(kolPatrol[1]>0)
        then begin
          i:=random(100);
          if money[1]>=masCoast[i]
          then begin
            case i of
              0..10:tBuildA:=77;
              11..20:tBuildA:=80;
              21..45:tBuildA:=76;
              46..75:tBuildA:=78;
              76..100:tBuildA:=79;
            end;
            if money[1]>=masCoast[tBuildA]
            then begin
              money[1]:=money[1]-masCoast[i];
              timebuildA:=mastimebuild[tBuildA];;
              stA^.push(2);
              sostA:=1;
            end;
          end
        end
      end;
    1:begin
        if TimeBuildA>0 then dec(TimeBuildA)
        else sostA:=stA^.pop;
      end;
    2:begin
        event2.watch:=cmEvent;
        event2.code:=cmWho3;
        event2.pow:=0;
        event2.tip:=123;
        message(enemyhouse,event2);
        if (event2.pow=cmItIsWho)and(memAvail>20000)
        then begin
          for i:=event2.x-1 to event2.x+event2.sx do
            for j:=event2.y-1 to event2.y+event2.sy do
              if (i>=0)and(j>=0)and(i<=maxx)and(j<=maxy)
              and(pole[i,j,1] in[0]) then
              begin
                if patrol[1]
                then begin
                  pGroup(enemyAir)^.insert(new(pAir,init(i,j,i,j,i,j,0,0,
                  masPow[tBuilda],maspow[tBuilda],1,0,tBuildA,1,32,32,2,0,false,0,0,
                  masDis[tBuilda],masdam[tbuilda],masTime[tBuilda],nil,0,true)));
                  dec(kolPatrol[1]);
                  if kolPatrol[1]=0
                  then patrol[1]:=false;
                  sostA:=0;
                  exit;
                end
                else begin
                  dec(kolAir);
                  event2.otkogo:=nil;
                  event2.x:=i;
                  event2.y:=j;
                  event2.watch:=cmEvent;
                  event2.code:=cmNewDefen;
                  event2.pow:=1;
                  message(enemyhouse,event2);
                  if (event2.otkogo<>nil)
                  then begin
                    pGroup(enemyAir)^.insert(new(pAir,init(i,j,event2.x,event2.y,i,j,0,0,
                    masPow[tBuilda],maspow[tBuilda],1,0,tBuildA,1,32,32,2,0,false,0,0,
                    masDis[tBuilda],masdam[tbuilda],masTime[tBuilda],event2.otkogo,255,false)))
                  end
                  else begin
                    pGroup(enemyAir)^.insert(new(pAir,init(i,j,event2.x,event2.y,i,j,0,0,
                    masPow[tBuilda],masPow[tBuilda],1,0,tBuildA,1,32,32,2,0,false,0,0,
                    masDis[tBuilda],masdam[tbuilda],masTime[tBuilda],event2.otkogo,0,false)))
                  end;
                  sostA:=0;
                  exit;
                end
              end
        end
        else begin
        end;
      end;
  end;
end;

begin
  if (construction)and(flagNewBuild)and(sostB=5)
  and not(sostB in[1,3])
  then begin
    sostB:=0;
    flagNewBuild:=false;
  end;
  if (construction)and(maxenerge[1]<energe[1])
  and(maxBuild[125]=numberBuild[125])
  then begin
    inc(maxbuild[125]);
    flagNewBuild:=true;
  end;
  if flagBuildTank then createTank;
  if flagBuildAir then createAir;
  createbuild;
end;

procedure tDeskTop.DeleteGroup;
var pp:pObject;
    f:boolean;
begin
  f:=true;
  if (ViborRobot^.elem<>nil)and(ViborRobot^.last<>nil) then
  begin
    pp:=viborRobot^.last;
    repeat
      pp:=pp^.next;
      newowner(pp,myRobot);
      modifpole2(pp^.x,pp^.y,tip);
      fff:=true;
    until pp=viborRobot^.last;

    if (myRobot^.elem=nil)and(myRobot^.last=nil) then
    begin
      myRobot^.elem:=ViborRobot^.elem;
      myRobot^.last:=ViborRobot^.last;
      viborRobot^.elem:=nil;viborRobot^.last:=nil;
      f:=false;
    end;
    if f then begin
      myRobot^.elem^.pred:=ViborRobot^.last;
      if myRobot^.elem<>nil then
        ViborRobot^.last^.next:=myRobot^.elem;
      myRobot^.last^.next:=viborRobot^.elem;
      if myRobot^.last<>nil then
        viborRobot^.elem^.pred:=myRobot^.last;
      myRobot^.last:=viborRobot^.last;
      viborRobot^.elem:=nil;viborRobot^.last:=nil;
    end;
  end;

  if (ViborTank^.elem<>nil)and(Vibortank^.last<>nil) then
  begin
    pp:=vibortank^.last;
    repeat
      pp:=pp^.next;
      newowner(pp,mytank);
      modifpole2(pp^.x,pp^.y,tip);
      fff:=true;
    until pp=vibortank^.last;

    if (mytank^.elem=nil)and(mytank^.last=nil) then
    begin
      mytank^.elem:=Vibortank^.elem;
      mytank^.last:=Vibortank^.last;
      vibortank^.elem:=nil;vibortank^.last:=nil;
      f:=false;
    end;
    if f then begin
      mytank^.elem^.pred:=Vibortank^.last;
      if mytank^.elem<>nil then
        Vibortank^.last^.next:=mytank^.elem;
      myTank^.last^.next:=vibortank^.elem;
      if mytank^.last<>nil then
        vibortank^.elem^.pred:=mytank^.last;
      mytank^.last:=vibortank^.last;
      vibortank^.elem:=nil;vibortank^.last:=nil;
    end;
  end;

  if (ViborAir^.elem<>nil)and(ViborAir^.last<>nil) then
  begin
    pp:=viborAir^.last;
    repeat
      pp:=pp^.next;
      newowner(pp,MyAir);
      modifpole2(pp^.x,pp^.y,tip);
      fff:=true;
    until pp=viborAir^.last;

    if (myAir^.elem=nil)and(myAir^.last=nil) then
    begin
      myAir^.elem:=ViborAir^.elem;
      myAir^.last:=ViborAir^.last;
      viborAir^.elem:=nil;viborAir^.last:=nil;
      exit;
    end;
    myAir^.elem^.pred:=ViborAir^.last;
    if myAir^.elem<>nil then
      ViborAir^.last^.next:=myAir^.elem;
    myAir^.last^.next:=viborAir^.elem;
    if myAir^.last<>nil then
      viborAir^.elem^.pred:=myAir^.last;
    myAir^.last:=viborAir^.last;
    viborAir^.elem:=nil;viborAir^.last:=nil;
  end;
end;

procedure tDeskTop.CreateGroup(x1,y1,x2,y2:integer);
var j,i1,j1,lx,ly:byte;
    i:integer;
    Event:tEvent;
begin
  if x1>x2 then begin
    i:=x1;x1:=x2;x2:=i;
  end;
  if y1>y2 then begin
    i:=y1;y1:=y2;y2:=i;
  end;
  i1:=round(int(x1/40))+polex;
  j1:=round(int(y1/40))+poley;
  lx:=round(int(x2-x1)/40);
  ly:=round(int(y2-y1)/40);
  deletegroup;
  for i:=i1 to i1+lx do
    for j:=j1 to j1+ly do
    begin
      if (i<=maxx)and(j<=maxy) then
      begin
        case pole[i,j,0] of
          23..29,205,116:begin
                   Event.watch:=cmevent;
                   Event.code:=cmWho2;
                   event.ras:=0;
                   Event.pow:=111;
                   Event.x:=i;
                   Event.y:=j;
                   message(myTank,Event);
                   if Event.code<>cmItIsWho then message(myRobot,Event);
                   if Event.code=cmItIsWho then
                   begin
                     sel:=nil;
                     Event.Code:=cmInsertToVibor;
                     if (event.tip in[23,26..29])then message(mytank,event);
                     if (event.tip in[24..25])then message(myRobot,event);
                   end;
                 end;
        end;
        case pole[i,j,1] of
          30..39:begin
               Event.watch:=cmevent;
               Event.code:=cmWho2;
               Event.pow:=111;
               event.ras:=0;
               Event.x:=i;
               Event.y:=j;
               message(myAir,Event);
               if Event.code=cmItIsWho then
               begin
                 sel:=nil;
                 Event.Code:=cmInsertToVibor;
                 if event.tip>=30 then message(myAir,event);
               end;
             end;
       end;
     end;
   end;
  event.watch:=cmNothing;
end;

function tDeskTop.puthouse(x1,y1,sx,sy,tp:integer):boolean;
var i1,i2,j1,j2,i,j:integer;
    s1,s2:string;
    f:boolean;
begin
  puthouse:=false;
  f:=false;
  if x1+polex-5>0 then i1:=x1+polex-5 else i1:=0;
  if x1+sx+polex-1+5<maxx then i2:=x1+sx+polex-1+5 else i2:=maxx;
  if y1+poley-5>0 then j1:=y1+poley-5 else j1:=0;
  if y1+sy+poley-1+5<maxy then j2:=y1+sy+poley-1+5 else j2:=maxy;
{*пров на близ*}
{  for i:=i1 to i2 do
  begin
    for j:=j1 to j2 do
    begin
      if (pole[i,j,0] in[100..119,200,205])then begin
        f:=true;
      end;
    end;
  end;
  if not f then exit;}
{***}
  puthouse:=true;
  if (x1+sx+polex-1>maxx)or(y1+sy+poley-1>maxy)then begin
   puthouse:=false;
   exit;
  end;
  for i:=x1+polex to x1+sx+polex-1 do
  begin
    for j:=y1+poley to y1+sy+poley-1 do
    begin
      if (pole[i,j,0]<>0)and(pole[i,j,0]<>3)and(pole[i,j,0]<>4) then begin
        puthouse:=false;
      end;
    end;
  end;
  if (pole[x1+polex,y1+poley,0]=10)and(tp=112)then puthouse:=true;
  if (pole[x1+polex,y1+poley,0]<>10)and(tp=112)then puthouse:=false;
end;

procedure tDeskTop.PutEvent(code:word);
var Event:tEvent;
begin
  Event.watch:=cmEvent;
  event.code:=code;
  inherited handleevent(event);
end;

procedure tDeskTop.panel(f:boolean);
var nn,n,i,j,k:integer;
    hand:word;
    event2:tevent;
begin
  setwsize(0,0,640,480);
  hidemouse;
  if not f
  then begin
    button(26,27,false);
    str(Money[0],st);
    setcolor(0);
    outTextxy(xxx+20+2,yyy3+3,st);
    setcolor(yellow);
    outTextxy(xxx+20+1,yyy3+2,st);
  end
  else begin
    i:=0;j:=0;n:=1;nn:=0;
    drawWindow(520,radary+maxy+16,640,480,hand);
    button(0,27,false);
    button(25,27,remont);
    button(26,27,false);
    button(27,27,false);
    button(98,29,false);
    button(99,29,false);
    button(100,29,false);
    str(Money[0],st);
    setcolor(0);
    outTextxy(xxx+20+2,yyy3+3,st);
    setcolor(yellow);
    outTextxy(xxx+20+1,yyy3+2,st);
    if selhouse<>nil then
    begin
      event2.watch:=cmEvent;
      event2.code:=cmGetNum;
      event2.komu:=selhouse;
      message(myhouse,event2);
      if event2.code=cmitiswho then
      begin
        nn:=event2.x
      end;
    end;
    for k:=0 to maxicon do
    begin
      if masflagicon[k] then
      begin
        if n<>nn then button(n,29,false);
        case k of
          12:if not masMyFlagBuild[112]
            then
            button(n,33,false);
          13:if not masMyFlagBuild[114]
            then
            button(n,33,false);
          14:if not masMyFlagBuild[113]
            then
            button(n,33,false);
          15:if not masMyFlagBuild[116]
            then
            button(n,33,false);
          16:if not masMyFlagBuild[117]
            then
            button(n,33,false);
          17:if not masMyFlagBuild[118]
            then
            button(n,33,false);
        end;
        if n=nn then button(n,29,true);
        putsprite(3+xxx+i*42,3+yyy+j*42,masicon[k]);
        inc(i);inc(n);
        if i>1 then begin
          inc(j);i:=0;
        end;
      end;
    end;
  end;
{  if energe[0]>maxenerge[0]
  then begin
    putsprite(xxx+60+4,yyy3,pict[6]);
  end
  else begin
    putsprite(xxx+60+4,yyy3,pict[7]);
  end;}
  showmouse;
  setwsize(0,0,520,480);
end;

procedure tDesktop.showAll(f:byte);
begin
  setcolor(white);
  line(520,0,520,480);
  case f of
    0:showpole(false);
    1,2:showallpole(false);
  end;
  if f<>2
  then begin
    myhouse^.show;
    enemyhouse^.show;
    myturret^.show;
    enemyturret^.show;
    myRobot^.show;
    mytank^.show;
    enemyRobot^.show;
    enemytank^.show;
    viborRobot^.show;
    vibortank^.show;
    smoke2^.show;
  end;
  case f of
    0:showpole(true);
    1,2:showallpole(true);
  end;
  if f<>2
  then begin
    enemyair^.show;
    myair^.show;
    viborair^.show;
    smoke^.show;
    rocet^.show;
  end;
  if flagShowMove
  then begin
    if timeShowMove>0
    then begin
      modifpole2(showMove[2],ShowMove[3],1);
      if timeShowMove>2 then putsprite(showMove[0]-polex*40,ShowMove[1]-poley*40,PictMove[0]);
      dec(timeShowMove)
    end
    else begin
      flagShowMove:=false;
      timeShowMove:=time14;
    end;
  end;
end;

procedure tDesktop.HandleEvent(var Event:tEvent);
var f,ff:boolean;
    xx,yy,i,j,ii,jj:integer;
    ppp,pp:pObject;
    event3,Event2:tEvent;
begin
  f:=false;ff:=false;
  if (flagCursor=255)and(mousex<520)
  then begin
    flagCursor:=oldFlagCursor;
    setcursor(cursor);
  end;
  if (vibor)and(cursor<>0)and(flagCursor<>254)
  then begin
    oldFlagCursor:=flagCursor;
    flagCursor:=254;
    setCursor(0);
  end;
  if (flagCursor=254)and not(vibor)
  then begin
    flagCursor:=oldFlagCursor;
    setCursor(cursor);
  end;
  if (flagCursor<>255)and(mousex>=520)and(cursor<>0)
  then begin
    oldFlagCursor:=flagCursor;
    flagCursor:=255;
    setcursor(0);
  end;
  if (cursor=0)and(flagCursor<>1)
  and((vibortank^.elem<>nil)or(viborair^.elem<>nil))
  and not(chronoCur)
  then begin
    flagCursor:=1;
  end;
  if (flagCursor=1)and(vibortank^.elem=nil)
  and(viborair^.elem=nil)
  then begin
    flagCursor:=0;
    cursor:=0;
    setCursor(cursor);
  end;
  if (flagCursor=1)and(mousex<520)and not(chronoCur)and(not flagMenu)
  then begin
    xx:=mousex div 40 +polex;
    yy:=mousey div 40 +poley;
    if (pole[xx,yy,0] in[23..29,100..119,200,205])
    or(pole[xx,yy,1] in[30..36])
    then begin
      cursor:=0;
      setcursor(cursor);
    end
    else begin
      if not(pole[xx,yy,0] in[50..80,121..130,201,206])
      and not(pole[xx,yy,1] in[76..80])
      then begin
        cursor:=3;
        setcursor(cursor);
      end
      else begin
        setcursor(4);
      end;
    end;
  end;
  if event.watch=cmEvent
  then begin
    case event.code of
      cmNewHouse:begin
                   pgroup(event.otkogo)^.insert(new(pHouse,Init2));
                   exit;
                 end;
      cmNewtank:begin
                  pgroup(event.otkogo)^.insert(new(ptank,Init2));
                  exit;
                end;
      cmNewRobot:begin
                  pgroup(event.otkogo)^.insert(new(pRobot,Init2));
                  exit;
                end;
      cmNewAir:begin
                 pgroup(event.otkogo)^.insert(new(pAir,Init2));
                 exit;
               end;
      cmNewRoc:begin
                 pgroup(event.otkogo)^.insert(new(pRocet,Init2));
                 exit;
               end;
      cmNewRoc2:begin
                  pgroup(event.otkogo)^.insert(new(pRocet2,Init2));
                  exit;
                end;
      cmNewSm:begin
                pgroup(event.otkogo)^.insert(new(pSmoke,Init2));
                exit;
              end;
      cmGetKoord:begin
                   event.x:=tarx;
                   event.y:=tary;
                 end;
      cmSmoke:begin
                if event.mvx=1
                then begin
                  if event.pow=1
                  then begin
                    if event.tip in[31,77]
                    then begin
                      if event.ang in[0,4]
                      then begin
                        event.y:=event.y-23;
                        pGroup(smoke)^.insert(new(pSmoke,init(event.x+random(3),event.y+random(5),event.tm2,event.mvy)));
                        event.y:=event.y+25;
                        pGroup(smoke)^.insert(new(pSmoke,init(event.x+random(3),event.y+random(5),event.tm2,event.mvy)));
                      end;
                      if event.ang in[2,6]
                      then begin
                        event.y:=event.y-5;
                        event.x:=event.x-13;
                        pGroup(smoke)^.insert(new(pSmoke,init(event.x+random(3),event.y+random(5),event.tm2,event.mvy)));
                        event.x:=event.x+25;
                        pGroup(smoke)^.insert(new(pSmoke,init(event.x+random(3),event.y+random(5),event.tm2,event.mvy)));
                      end;
                      if event.ang in[1,5]
                      then begin
                        event.x:=event.x-13;
                        event.y:=event.y-15;
                        pGroup(smoke)^.insert(new(pSmoke,init(event.x+random(3),event.y+random(5),event.tm2,event.mvy)));
                        event.x:=event.x+25;
                        event.y:=event.y+25;
                        pGroup(smoke)^.insert(new(pSmoke,init(event.x+random(3),event.y+random(5),event.tm2,event.mvy)));
                      end;
                      if event.ang in[3,7]
                      then begin
                        event.x:=event.x-13;
                        event.y:=event.y+10;
                        pGroup(smoke)^.insert(new(pSmoke,init(event.x+random(3),event.y+random(5),event.tm2,event.mvy)));
                        event.x:=event.x+25;
                        event.y:=event.y-25;
                        pGroup(smoke)^.insert(new(pSmoke,init(event.x+random(3),event.y+random(5),event.tm2,event.mvy)));
                      end;
                    end
                    else pGroup(smoke)^.insert(new(pSmoke,init(event.x+random(3),event.y+random(5),event.tm2,event.mvy)));
                  end;
                end
                else begin
                  if event.pow=1 then pGroup(smoke2)^.insert(new(pSmoke,init(event.x+random(3),event.y+random(5),
                  event.tm2,event.mvy)));
                  if event.pow=2
                  then begin
                    pGroup(smoke2)^.insert(new(pSmoke,init(event.x+random(3)+(event.sx div 2),
                    event.y+random(5)+(event.sy div 2)-10,event.tm2,event.mvy)));
                    pGroup(smoke2)^.insert(new(pSmoke,init(event.x+random(3)+(event.sx div 2)-20,
                    event.y+random(5)+(event.sy div 2)+10,event.tm2,event.mvy)));
                    pGroup(smoke2)^.insert(new(pSmoke,init(event.x+random(3)+(event.sx div 2)+20,
                    event.y+random(5)+(event.sy div 2)+10,event.tm2,event.mvy)));
                  end;
                end;
              end;
      cmPutHouse:begin
                   pDesktop(enemyhouse)^.insert(new(phouse,Init(event.x,event.y,massize[121,0],
                   massize[121,1],121,1,maspow[121],maspow[121])));
{                   sostB:=1;}
                   exit;
                 end;
    end;
  end;
  if (flagcloack)
  then begin
    if(event.watch=cmMouse)and(event.button<>0)
    then
      event.watch:=cmNothing;
    if(event.watch=cmMouse)and(event.button=0)
    then
      flagCloack:=false;
  end;
  if (event.watch=cmMouse)
  then begin
    if (event.button=2)and(chronoCur)
    then begin
      cursor:=oldCursor;
      if oldCursor=5 then cursor:=0;
      setCursor(cursor);
      chronoCur:=false;
      flagCloack:=true;
      exit;
    end;
    if (event.button=2)and(remont)
    then begin
      cursor:=0;
      setCursor(cursor);
      remont:=false;
      newpanel[0]:=true;newpanel[1]:=true;
    end;
    if (event.button=0)
    then begin
      if(event.xm>520)and(event.ym>radary+maxy+15)and not(chronoCur)
      then begin
        j:=numIcon(event.xm,event.ym);
        if {not(newHelp[page])and}(selHouse<>nil)
        and(j<>0)
        then begin
          help[1]:=true;
          help[0]:=true;
          newhelp[page]:=true;
          event2.watch:=cmEvent;
          event2.code:=cmGetTip;
          event2.komu:=selHouse;
          message(selHouse,event2);
          if event2.x=0
          then begin
            setwsize(0,0,640,480);
            borlandsetTextSize(1);
            hidemouse;
            button(0,27,false);
            case event2.tip of
              111:begin
                    if j<=8 then
                    putsprite(xxx2+20,yyy2+1,masicon[j+9]);
                    setcolor(119);
                    case j of
                      1:borlandOutTextxy(xxx2+13,yyy2+37,'Сбор.двор',littp);
                      2:borlandOutTextxy(xxx2+10,yyy2+37,'Эл.станция',littp);
                      3:borlandOutTextxy(xxx2+15,yyy2+37,'Добытчик',littp);
                      4:borlandOutTextxy(xxx2+1,yyy2+37,'Танковый зав.',littp);
                      5:borlandOutTextxy(xxx2+12,yyy2+37,'Авиазавод',littp);
                      6:begin
                          borlandOutTextxy(xxx2+12,yyy2+30,'Ремонтная',littp);
                          borlandOutTextxy(xxx2+15,yyy2+37,'площадка',littp);
                        end;
                      7:borlandOutTextxy(xxx2+23,yyy2+37,'Пушка',littp);
                      8:borlandOutTextxy(xxx2+18,yyy2+37,'Зенитка',littp);
                    end;
                  end;
              112:begin
                    if j<=2
                    then putsprite(xxx2+20,yyy2+1,masicon[j+17]);
                    setcolor(119);
                    case j of
                      1:begin
                          borlandOutTextxy(xxx2+20,yyy2+30,'Легкий',littp);
                          borlandOutTextxy(xxx2+12,yyy2+37,'харвестер',littp);
                        end;
                      2:begin
                          borlandOutTextxy(xxx2+17,yyy2+30,'Тяжелый',littp);
                          borlandOutTextxy(xxx2+12,yyy2+37,'харвестер',littp);
                        end;
                    end;
                  end;
              113:begin
                    if j<=6
                    then putsprite(xxx2+20,yyy2+1,masicon[j-1]);
                    setcolor(119);
                    case j of
                      1:begin
                          borlandOutTextxy(xxx2+17,yyy2+30,'Средний',littp);
                          borlandOutTextxy(xxx2+7,yyy2+37,'истребитель',littp);
                        end;
                      2:begin
                          borlandOutTextxy(xxx2+20,yyy2+30,'Легкий',littp);
                          borlandOutTextxy(xxx2+7,yyy2+37,'истребитель',littp);
                        end;
                      3:borlandOutTextxy(xxx2+17,yyy2+37,'Крейсер',littp);
                      4:borlandOutTextxy(xxx2+12,yyy2+37,'Невидимка',littp);
                      5:borlandOutTextxy(xxx2+15,yyy2+37,'Детектор',littp);
                      6:borlandOutTextxy(xxx2+13,yyy2+37,'Транспорт',littp);
                    end;
                  end;
              114:begin
                    if j<=5
                    then putsprite(xxx2+20,yyy2+1,masicon[j+19]);
                    setcolor(119);
                    case j of
                      1:begin
                          borlandOutTextxy(xxx2+20,yyy2+30,'Легкий',littp);
                          borlandOutTextxy(xxx2+26,yyy2+37,'танк',littp);
                        end;
                      2:begin
                          borlandOutTextxy(xxx2+16,yyy2+30,'Средний',littp);
                          borlandOutTextxy(xxx2+26,yyy2+37,'танк',littp);
                        end;
                      3:begin
                          borlandOutTextxy(xxx2+16,yyy2+30,'Тяжелый',littp);
                          borlandOutTextxy(xxx2+26,yyy2+37,'танк',littp);
                        end;
                      4:begin
                          borlandOutTextxy(xxx2+2,yyy2+37,'Осадный танк',littp);
{                          borlandOutTextxy(xxx2+17,yyy2+30,'Осадный',littp);
                          borlandOutTextxy(xxx2+26,yyy2+37,'танк',littp);}
                        end;
                      5:begin
                          borlandOutTextxy(xxx2+3,yyy2+37,'"Chrono" танк',littp);
                        end;
                    end;
                  end;
            end;
            showmouse;
          end;
          setwsize(0,0,520,480);
        end;
      end;
      if (event.xm<520)and(event.ym<radary+maxy+15)
      or((numicon(event.xm,event.ym)=0))
      then begin
        if help[page]
        then begin
          setwsize(0,0,640,480);
          hidemouse;
          button(0,27,false);
          showmouse;
          setwsize(0,0,520,480);
          help[page]:=false;
          newhelp[0]:=false;
          newhelp[1]:=false;
        end
      end
    end
  end;

  if (Event.watch=cmMouse)and(event.button=1)and
  (event.xm>520)and not(chronoCur)
  then begin
    i:=numicon(event.xm,event.ym);
    if i in[100]
    then begin
      event2.watch:=cmEvent;
      event2.code:=cmCloack;
      message(viborair,event2);
      message(vibortank,event2);
      flagcloack:=true;
      event.watch:=cmNothing;
    end;
    if i in[99]
    then begin
      event2.watch:=cmEvent;
      event2.code:=cmAllUnLoad;
      message(viborair,event2);
      message(vibortank,event2);
      flagcloack:=true;
      event.watch:=cmNothing;
    end;
    if i in[98]
    then begin
      event2.watch:=cmEvent;
      event2.code:=cmOneUnLoad;
      message(viborair,event2);
      message(vibortank,event2);
      flagcloack:=true;
      event.watch:=cmNothing;
    end;
    if i in[25]
    then begin
      if remont
      then begin
        cursor:=0;
        setCursor(cursor);
      end
      else begin
        cursor:=2;
        setCursor(cursor);
      end;
      remont:=not(remont);
      if remont
      then begin
        Event2.watch:=cmEvent;  {select:=0}
        Event2.code:=cmUnSelect;
        message(viborAir,event2);
        message(viborTank,event2);
        message(enemyTank,event2);
        message(enemyAir,event2);
        message(myTurret,event2);
        message(enemyTurret,event2);
        message(enemyHouse,event2);
        deletegroup;
      end;
      newpanel[0]:=true;newpanel[1]:=true;
      flagcloack:=true;
    end;
  end;
  if (event.watch=cmMouse)and(event.button=2)and(build)then
    message(myhouse,event);
  if (Event.watch=cmMouse)and(flagbuildhouse)then
  begin
    if (ViborAir^.elem<>nil)or(ViborTank^.elem<>nil)
    then deletegroup;
    if Event.button=0 then begin
(*      if (oldmousex[page]>0)and(oldmousex[page]<640)and(oldmousey[page]>0)and(oldmousey[page]<480)
      then modifpole(oldmousex[page]-50,oldmousey[page]-50,oldmousex[page]+120,oldmousey[page]+120);
      modifpole(Event.xm-50,Event.ym-50,Event.xm+50,Event.ym+50{0,0,520,480});*)
      pereris[0]:=true;
      pereris[1]:=true;
      hidemouse;
      if puthouse((Event.xm div 40),(event.ym div 40),massize[tipbuild,0],massize[tipbuild,1],tipbuild)
      then
        if tipbuild in[110..116] then putsprite((Event.xm div 40)*40,(event.ym div 40)*40,houses[tipbuild,0])
        else putsprite((Event.xm div 40)*40,(event.ym div 40)*40,tank[tipbuild,4])
      else
        if tipbuild in [110..116] then putsprites((Event.xm div 40)*40,(event.ym div 40)*40,houses[tipbuild,0])
        else putsprites((Event.xm div 40)*40,(event.ym div 40)*40,tank[tipbuild,4]);
      oldmousex[page]:=Event.xm;oldmousey[page]:=Event.ym;
      showmouse;
  {    modifpole(event.xm-50,event.ym-50,event.xm+50,event.ym+50);}
  {    pereris[0]:=true;pereris[1]:=true;}
    end;
    if Event.button=1 then begin
      if(event.xm<520)and(puthouse((Event.xm div 40),(event.ym div 40),
      massize[tipbuild,0],massize[tipbuild,1],tipbuild))then
      begin
        pereris[0]:=true;
        pereris[1]:=true;
        if tipbuild in[110..116]then
        pdesktop(myhouse)^.insert(new(phouse,init
        ((Event.xm div 40)+polex,(Event.ym div 40)+poley,
        massize[tipbuild,0],massize[tipbuild,1],tipbuild,rasbuild,maspow[tipbuild],maspow[tipbuild])));
        if tipbuild in[25..44] then
        begin
          i:=(event.xm div 40)+polex;
          j:=(event.ym div 40)+poley;
          pgroup(myturret)^.insert(new(pTank,init(i,j,i,j,i,j,0,0,
          maspow[tipbuild] div 1,maspow[tipbuild],rasbuild,0,tipbuild,4,40,40,0,100,false,0,0,240+80,50,30,nil,255,false)));
        end;
        flagbuildhouse:=false;
        build:=false;
        event.watch:=cmEvent;
        Event.code:=cmPutbuild;
        message(otkogo,event);
        event.watch:=cmNothing;
      end;
      Event.watch:=cmNothing;
    end;
  end;
  if (Event.watch=cmEvent)
  then begin
    if (event.code=cmIAmDied)
    then begin
      if flagbuildhouse=true
      then flagbuildhouse:=false;
      Event.watch:=cmNothing;
      pereris[0]:=true;pereris[1]:=true;
      exit;
    end;
    if (Event.code=cmHouse)
    then begin
      flagbuildhouse:=true;
      tipbuild:=Event.tip;
      rasbuild:=event.ras;
      otkogo:=event.otkogo;
      Event.watch:=cmNothing;
      exit;
    end;
    if (Event.code=cmNoHouse)
    then begin
      if flagbuildhouse=true
      then flagbuildhouse:=false;
      Event.watch:=cmNothing;
      exit;
    end;
    if (Event.code=cmRobot)
    then begin
      pgroup(Event.komu)^.insert(new(pRobot,init(Event.x,Event.y,Event.newx,Event.newy,Event.x,Event.y,0,0,
      event.pow div 1,event.pow,event.ras,0,Event.tip,Event.ang,37,37,Event.step,Event.tm2,Event.mov,0,0,event.buil)));
      event.watch:=cmNothing;
      exit;
    end;
    if (Event.code=cmTank)
    then begin
        pgroup(Event.komu)^.insert(new(pTank,init(Event.x,Event.y,Event.newx,Event.newy,Event.x,Event.y,0,0,
        event.pow div 1,event.pow,event.ras,0,Event.tip,Event.ang,Event.sx,Event.sy,Event.step,Event.tm2,
        Event.mov,0,0,event.dis,event.dam,event.tim,nil,255,false)));
      event.watch:=cmNothing;
      exit;
    end;
    if (Event.code=cmAir)
    then begin
      i:=0;
      if event.tip in[30..39]
      then pgroup(Event.komu)^.insert(new(pAir,init(Event.x,Event.y,Event.newx,Event.newy,Event.x,Event.y,0,0,
        event.pow div 1,event.pow,event.ras,0,Event.tip,Event.ang,Event.sx,Event.sy,Event.step,
        Event.tm2,Event.mov,i,i,event.dis,event.dam,event.tim,nil,255,false)));
      event.watch:=cmNothing;
      exit;
    end;
  end;
  if event.watch=cmmouse then
  begin
    Event3:=event;
    if (flagpressmouse)and(((mousex1-Event.xm<10)and(mousey1-Event.ym<10))and((mousey1-Event.ym>-10)or(mousey1-Event.ym>-10)))
    and(Event.button=0)and(Event.xm>520)and not(chronoCur)
    then begin
      flagpressmouse:=false;
      Event.button:=1;
      message(myhouse,event);
      Event.button:=0;
{      exit;}
    end;
    if (not flagPressMouse) then
    begin
      case Event.button of
        2:begin
            newx:=event.xm;newy:=event.ym;
            if (flagbuildhouse) then begin
              Event.watch:=cmEvent;
              Event.code:=cmNoPutBuild;
              message(otkogo,event);
              flagbuildhouse:=false;
              pereris[0]:=true;
              pereris[1]:=true;
              Event.watch:=cmNothing;
            end;
            if (ViborAir^.elem<>nil)or(Vibortank^.elem<>nil)
            or(ViborRobot^.elem<>nil)
{            or(sel=nil)}then
            begin
              event2.watch:=cmEvent;
              Event2.code:=cmNewGo;
              Event2.newx:=newx;
              Event2.newy:=newy;
              message(viborAir,event2);
              message(viborTank,event2);
              message(viborRobot,event2);
              Event.watch:=cmNothing;

              i:=round(int(Event.xm/40))+polex;
              j:=round(int(Event.ym/40))+poley;
              if (i<=maxx)and(j<=maxy){and(i-polex<=12)}then
              begin
{                ii:=event.xm;jj:=event.ym;}
                event2.watch:=cmEvent;
                Event2.code:=cmWho;
                event2.x:=event.xm;Event2.y:=event.ym;
                message(EnemyAir,event2);
                if Event2.code<>cmItIsWho then message(EnemyTank,event2);
                if Event2.code<>cmItIsWho then message(EnemyRobot,event2);
                if Event2.code<>cmItIsWho then message(EnemyTurret,event2);
                if Event2.code<>cmItIsWho then message(EnemyHouse,event2);
                if Event2.code=cmItIsWho then
                begin
                  Event2.code:=cmAttack;
                  Event2.x:=event.x+polex*40;
                  Event2.y:=event.y+poley*40;
                  message(viborTank,event2);
                  message(viborAir,event2);
                  message(MyTurret,event2);
                  Event.watch:=cmNothing;
                end
                else begin
                  if not flagShowMove
                  then begin
                    flagShowMove:=true;
                    ShowMove[0]:=event.xm+polex*40-20;
                    ShowMove[1]:=event.ym+poley*40-20;
                    ShowMove[2]:=(event.xm+polex*40-20)div 40;
                    ShowMove[3]:=(event.ym+poley*40-20)div 40;
                  end;
{                  event2.watch:=cmEvent;
                  Event2.code:=cmNewGo;
                  Event2.newx:=newx;
                  Event2.newy:=newy;
                  message(viborAir,event2);
                  message(viborTank,event2);
                  Event.watch:=cmNothing;}
                end;
              end;
            end;
            if (sel<>nil)and(sel^.tip in[40..45]) then
            begin
              i:=round(int(Event.xm/40))+polex;
              j:=round(int(Event.ym/40))+poley;
              if (i<=maxx)and(j<=maxy)and(i-polex<=12)then begin
{                ii:=event.xm;jj:=event.ym;}
                event2.watch:=cmEvent;
                Event2.code:=cmWho;
                event2.x:=event.xm;Event2.y:=event.ym;
                message(EnemyAir,event2);
                if Event2.code<>cmItIsWho then message(EnemyTank,event2);
                if Event2.code<>cmItIsWho then message(EnemyRobot,event2);
                if Event2.code<>cmItIsWho then message(EnemyTurret,event2);
                if Event2.code=cmItIsWho then
                begin
                  Event2.code:=cmAttack;
                  Event2.x:=event.x+polex*40;
                  Event2.y:=event.y+poley*40;
                  message(sel,event2);
{                  Event2.watch:=cmNothing;}
                end;
              end;

            end;
          end;
        1:begin
            if (event.xm>520)and(event.xm>radarx)and(event.xm<radarx+maxx)and
            (event.ym>radary)and(event.ym<radary+maxy) then
            begin
              polex:=event.xm-radarx-6;
              poley:=event.ym-radary-5;
              flagradar[0]:=true;
              flagradar[1]:=true;
              if polex<0 then polex:=0;
              if poley<0 then poley:=0;
              if polex>maxx-12 then polex:=maxx-12;
              if poley>maxy-11 then poley:=maxy-11;
              pereris[0]:=true;
              pereris[1]:=true;
            end
            else
              if not flagpressmouse then
              begin
                mousex1:=Event.xm;
                mousey1:=Event.ym;
                FlagPressMouse:=true;
                Event.watch:=cmNothing;
              end;
          end;
      end;
    end
    else begin
      if Event.button=1 then
      begin
        if ((mousex1-Event.xm>10)or(mousex1-Event.xm<-10)or
           (mousey1-Event.ym>10)or(mousey1-Event.ym<-10))
           and(not remont)and not(chronoCur)
        then begin
          setcolor(white);
          pereris[0]:=true;
          pereris[1]:=true;
(*          modifpole(mousex1,mousey1,event.xm,event.ym{0,0,520,480});*)
{          SetWriteMode(0);}
          vibor:=true;
          rectangle(mousex1,mousey1,event.xm,event.ym,15,15);
          putsprite(event.xm-9,event.ym-11,pict[8]);
          mousex2:=Event.xm;mousey2:=Event.ym;
          flagramka:=true;
          Event.watch:=cmNothing;
        end
        else
        begin
          Event.watch:=cmNothing;
        end;
      end;
      if Event.button=0 then
      begin
        flagPressMouse:=false;
        if ((mousex1-Event.xm>10)or(mousex1-Event.xm<-10)or(mousey1-Event.ym>10)or(mousey1-Event.ym<-10))
        and(not remont)and not(chronoCur)
        then begin
          Event2:=event;
          Event.watch:=cmEvent;  {select:=0}
          Event.code:=cmUnSelect;
          message(viborAir,event);
          message(viborTank,event);
          message(viborRobot,event2);
          message(enemyTank,event);
          message(enemyRobot,event);
          message(enemyAir,event);
          message(myTurret,event);
          message(enemyTurret,event);
          event:=event2;
          CreateGroup(mousex1,mousey1,event.xm,event.ym);
          flagramka:=false;
          vibor:=false;
          pereris[0]:=true;
          pereris[1]:=true;
        end
        else begin
{          i:=round(int(Event.xm/40))+polex;
          j:=round(int(Event.ym/40))+poley;}
          i:=event.xm;j:=event.ym;
          xx:=(i div 40)+polex;
          yy:=(j div 40)+poley;
          if (i<520)and(chronoCur)and(pole[xx,yy,0]in[0,3,4])
          then begin
            Event2.watch:=cmevent;
            Event2.code:=cmChrono;
            Event2.x:=xx;Event2.y:=yy;
            message(viborTank,event2);
          end;
          if (not remont)and(xx<=maxx)and(yy<=maxy)and not(chronoCur)
          then
          case pole[xx,yy,1] of
            30..39,0:if i div 40<polex+13 then
                     begin
                       Event2.watch:=cmevent;
                       Event2.code:=cmWho;
                       Event2.x:=i;Event2.y:=j;
                       message(myAir,event2);
                       if event2.code<>cmItIsWho then
                       message(viborAir,Event2);
                       if Event2.code=cmItIsWho then
                       begin
                         sel:=nil;
                         ff:=true;
                         Event2.watch:=cmEvent;  {select:=0}
                         Event2.code:=cmUnSelect;
                         message(enemyTank,event2);
                         message(enemyRobot,event2);
                         message(enemyAir,event2);
                         message(myTurret,event2);
                         message(enemyTurret,event2);
                         if not shift
                         then begin
                           message(viborAir,event2);
                           message(viborTank,event2);
                           message(viborRobot,event2);
                           deletegroup;
                         end;
                         Event2.Code:=cmInsertToVibor;
                         if Event2.tip>=30 then message(myair,event2);
                         event.watch:=cmNothing;
                         exit;
                       end;
{                       event.watch:=cmNothing;}
                     end;
          end;
          if(not remont)and(xx<=maxx)and(yy<=maxy)and not(chronoCur)
          then
          case pole[(i div 40)+polex,(j div 40)+poley,1] of
            76..85,0:if i div 40<polex+13 then
                     begin
                       Event2.watch:=cmevent;
                       Event2.code:=cmWho;
                       Event2.x:=i;Event2.y:=j;
                       message(EnemyAir,event2);
                       if Event2.code=cmitisWho then
                       begin
                         sel:=nil;
                         ff:=true;
                         Event2.watch:=cmEvent;  {select:=0}
                         Event2.code:=cmUnSelect;
                         message(viborAir,event2);
                         message(viborTank,event2);
                         message(viborRobot,event2);
                         message(enemyTank,event2);
                         message(enemyRobot,event2);
                         message(enemyAir,event2);
                         message(myTurret,event2);
                         message(enemyTurret,event2);
                         deletegroup;
                         Event2.otkogo^.select:=1;
                         event.watch:=cmNothing;
                         exit;
                       end;
{                       event.watch:=cmNothing;}
                     end;
          end;
          if (not ff)and(xx<=maxx)and(yy<=maxy)and not(chronoCur)
          then begin
            case pole[(i div 40)+polex,(j div 40)+poley,0] of
              110..119,200,205:begin
                           event2:=Event3;
                           if event2.button=0 then event2.button:=1;
                           message(myhouse,event2);
                           Event2.watch:=cmEvent;  {select:=0}
                           Event2.code:=cmUnSelect;
                           message(viborAir,event2);
                           message(viborTank,event2);
                           message(viborRobot,event2);
                           message(enemyTank,event2);
                           message(enemyRobot,event2);
                           message(enemyAir,event2);
                           message(myTurret,event2);
                           message(enemyTurret,event2);
                           deletegroup;
  {                         Event.watch:=cmNothing;}
                         end;
              120..129,201,206:if not remont then
                           begin
                           event2:=Event3;
                           if event2.button=0 then event2.button:=1;
                           message(enemyhouse,event2);
                           Event2.watch:=cmEvent;  {select:=0}
                           Event2.code:=cmUnSelect;
                           message(viborAir,event2);
                           message(viborTank,event2);
                           message(enemyTank,event2);
                           message(enemyRobot,event2);
                           message(viborRobot,event2);
                           message(enemyAir,event2);
                           message(myTurret,event2);
                           message(enemyTurret,event2);
                           deletegroup;
  {                         Event.watch:=cmNothing;}
                         end;
            end;
            case pole[(i div 40)+polex,(j div 40)+poley,0] of
              23..29,205,116:if (i div 40<polex+13)
                       and(not remont)
                       then begin
                         Event2.watch:=cmevent;
                         Event2.code:=cmWho;
                         Event2.x:=i;Event2.y:=j;
                         message(MyTank,event2);
                         if event2.code<>cmItIsWho then message(viborTank,Event2);
                         if event2.code<>cmItIsWho then message(MyRobot,Event2);
                         if event2.code<>cmItIsWho then message(viborRobot,Event2);
                         if Event2.code=cmItIsWho then
                         begin
                           sel:=nil;
                           Event2.watch:=cmEvent;  {select:=0}
                           Event2.code:=cmUnSelect;
                           message(enemyTank,event2);
                           message(enemyRobot,event2);
                           message(enemyAir,event2);
                           message(myTurret,event2);
                           message(enemyTurret,event2);
                           if not shift
                           then begin
                             message(viborAir,event2);
                             message(viborTank,event2);
                             message(viborRobot,event2);
                             deletegroup;
                           end;
                           Event2.Code:=cmInsertToVibor;
                           if Event2.tip in[24..25]
                           then message(myRobot,event2)
                           else message(mytank,event2);
                         end;
  {                       event.watch:=cmNothing;}
                       end;
              60..69,206,226:if (i div 40<polex+13)
                     and(not remont)
                     then begin
                       Event2.watch:=cmevent;
                       Event2.code:=cmWho;
                       Event2.x:=i;Event2.y:=j;
                       message(Enemytank,event2);
                       if Event2.code<>cmitisWho then message(enemyrobot,event2);
                       if Event2.code=cmitisWho then
                       begin
                         sel:=nil;
  {                         deletegroup;}
                         Event2.watch:=cmEvent;  {select:=0}
                         Event2.code:=cmUnSelect;
                         message(viborAir,event2);
                         message(viborTank,event2);
                         message(viborRobot,event2);
                         message(enemyTank,event2);
                         message(enemyAir,event2);
                         message(enemyRobot,event2);
                         message(myTurret,event2);
                         message(enemyTurret,event2);
                         Event2.otkogo^.select:=1;
                         deletegroup;
                       end;
  {                     event.watch:=cmNothing;}
                     end;
              40..42:if (i div 40<polex+13)
                     then begin
                       Event2.watch:=cmevent;
                       Event2.code:=cmWho;
                       Event2.x:=i;Event2.y:=j;
                       message(MyTurret,event2);
                       if event2.code=cmItIsWho then
                       begin
                         sel:=nil;
                         Event2.watch:=cmEvent;  {select:=0}
                         Event2.code:=cmUnSelect;
                         message(viborAir,event2);
                         message(viborTank,event2);
                         message(viborRobot,event2);
                         message(enemyTank,event2);
                         message(enemyRobot,event2);
                         message(enemyAir,event2);
                         message(myTurret,event2);
                         message(enemyTurret,event2);
                         deletegroup;

                         event2.code:=cmselect;
                         message(event2.otkogo,event2);
                       end;
  {                     event.watch:=cmNothing;}
                     end;
              70..75:if (i div 40<polex+13)
                     and(not remont)
                     then begin
                       Event2.watch:=cmevent;
                       Event2.code:=cmWho;
                       Event2.x:=i;Event2.y:=j;
                       message(EnemyTurret,event2);
                       if Event2.code=cmitisWho then
                       begin
                         sel:=nil;
                         Event2.watch:=cmEvent;  {select:=0}
                         Event2.code:=cmUnSelect;
                         message(viborAir,event2);
                         message(viborTank,event2);
                         message(viborRobot,event2);
                         message(enemyTank,event2);
                         message(enemyRobot,event2);
                         message(enemyAir,event2);
                         message(myTurret,event2);
                         message(enemyTurret,event2);
                         deletegroup;

                         event2.code:=cmselect;
                         message(event2.otkogo,event2);
                       end;
  {                     event.watch:=cmNothing;}
                     end;

            end;
          end;
        end;
      end;
    end;
  end;

  if (event.watch=cmKey)and(not remont)and not(flagChrono)
  then begin
    case event.key of
{      's','S','ы','Ы':begin
                    filename:='save1.sav';
                    save;
                  end;
      'l','L','д','Д':begin
                    filename:='save1.sav';
                    load2;
                  end;}
      'c','C','с','С':begin
                  event2.watch:=cmEvent;
                  event2.code:=cmCloack;
                  message(viborair,event2);
                  message(vibortank,event2);
                end;
      'e','E','у','У':if not(chronoCur)
              then begin
                Event2.watch:=cmEvent;  {select:=0}
                Event2.code:=cmUnSelect;
                message(viborAir,event2);
                message(viborTank,event2);
                message(viborRobot,event2);
                message(enemyTank,event2);
                message(enemyRobot,event2);
                message(enemyAir,event2);
                message(myTurret,event2);
                message(enemyTurret,event2);
                message(myHouse,event2);
                message(enemyHouse,event2);
                deletegroup;
                createGroup(0,0,520,480);
              end;
      'r','R','к','К':if not(chronoCur)
              then begin
                Event2.watch:=cmEvent;  {select:=0}
                Event2.code:=cmUnSelect;
                message(viborAir,event2);
                message(viborTank,event2);
                message(viborRobot,event2);
                message(enemyTank,event2);
                message(enemyRobot,event2);
                message(enemyAir,event2);
                message(myTurret,event2);
                message(enemyTurret,event2);
                message(myHouse,event2);
                message(enemyHouse,event2);
                deletegroup;
              end;
      '0'..'9':if not(chronoCur)
               then begin
                 Event2.watch:=cmEvent;  {select:=0}
                 Event2.code:=cmUnSelect;
                 message(enemyTank,event2);
                 message(enemyRobot,event2);
                 message(enemyAir,event2);
                 message(myTurret,event2);
                 message(enemyTurret,event2);
                 message(myHouse,event2);
                 message(enemyHouse,event2);
                 message(viborAir,event2);
                 message(viborTank,event2);
                 message(viborRobot,event2);
                 sel:=nil;
                 selHouse:=nil;
                 deletegroup;
                 event2.watch:=cmEvent;
                 event2.code:=cmToGroup;
                 event2.tip:=nomer(event.key);
                 message(myTank,event2);
                 message(myAir,event2);
                 message(myRobot,event2);
                 message(viborTank,event2);
                 message(viborAir,event2);
                 message(viborRobot,event2);
               end;
      #77:if (polex<maxx-12) then begin
            inc(polex);
            f:=true;
            flagradar[0]:=true;
            flagradar[1]:=true;
           end;
      #75:if polex>0 then begin
            dec(polex);
            f:=true;
            flagradar[0]:=true;
            flagradar[1]:=true;
           end;
      #80:if poley<maxy-11 then begin
            inc(poley);
            f:=true;
            flagradar[0]:=true;
            flagradar[1]:=true;
           end;
      #72:if poley>0 then begin
            dec(poley);
            f:=true;
            flagradar[0]:=true;
            flagradar[1]:=true;
           end;
    end;
    event.watch:=cmNothing;
  end;
  if (Event.watch=cmmouse)and(Event.button=0)and not(flagChrono) then
  begin
    case Event.Ym of
      0,1:begin
            if arrow=0
            then begin
              hidemouse;
              arrow:=3;
            end;
            if not f then putsprite(mousex,mousey,pict[12]);
            f:=true;
            if scrollTime>0 then dec(ScrollTime)
            else begin
              if poley>0 then begin
                dec(poley);
                flagradar[0]:=true;
                flagradar[1]:=true;
              end
            end;
          end;
      480,479:
          begin
            if arrow=0
            then begin
              hidemouse;
              arrow:=4;
            end;
            if not f then putsprite(mousex,mousey-22,pict[13]);
            f:=true;
            if scrollTime>0 then dec(ScrollTime)
            else begin
              if poley<maxy-11 then begin
                inc(poley);
                flagradar[0]:=true;
                flagradar[1]:=true;
              end
            end
          end;
    end;
    case Event.xm of
      0,1:begin
            if arrow=0
            then begin
              hidemouse;
              arrow:=5;
            end;
            if not f then putsprite(mousex,mousey,pict[14]);
            f:=true;
            if scrollTime>0 then dec(ScrollTime)
            else begin
              if polex>0 then begin
                dec(polex);
                flagradar[0]:=true;
                flagradar[1]:=true;
              end
            end;
          end;
      640,639:
            begin
              if arrow=0
              then begin
                hidemouse;
                arrow:=6;
              end;
              if not f then putsprite(mousex-21,mousey,pict[13]);
              f:=true;
              if scrollTime>0 then dec(ScrollTime)
              else begin
              if polex<maxx-12 then begin
                inc(polex);
                flagradar[0]:=true;
                flagradar[1]:=true;
              end
            end;
          end;
    end;
    if (arrow<>0)and(mousex<>0)and(mousex<>1)and(mousex<>640)and(mousex<>639)
    and(mousey<>479)and(mousey<>480)and(mousey<>0)and(mousey<>1)
    then begin
      arrow:=0;
      showmouse;
      pereris[0]:=true;
      pereris[1]:=true;
    end;
  end;
  if f
  then begin
    pereris[0]:=true;
    pereris[1]:=true;
{    newpanel[0]:=true;
    newpanel[1]:=true;}
    ScrollTime:=time;
  end;
end;

procedure tDeskTop.run;
var p:pObject;
    Event:tEvent;
begin
  flaggo:=false;flaggo2:=false;
  show2;
  repeat
    pole2[polex,poley]:=1;pole2[polex+1,poley]:=1;
    pole2[polex,poley+1]:=1;pole2[polex+1,poley+1]:=1;
    str(memavail,st);
    outtextxy(10,10,st);
    str(sostB,st);
    outtextxy(16,20,st);

    str(money[1],st);
    outtextxy(30,20,st);

    str(sostT,st);
    outtextxy(8,30,'t'+st);
    str(sostA,st);
    outtextxy(8,40,'a'+st);

    str(kolTank,st);
    outtextxy(30,30,st);
    str(KolAir,st);
    outtextxy(30,40,st);
    str(kolpatrol[0],st);
    outtextxy(50,30,st);
    str(Kolpatrol[1],st);
    outtextxy(50,40,st);

(*    str({sostB}money[1],st);
    outtextxy(10,10,st);*)

{    if endingplay then play('warning2.wav');}

    if not FlagMenu
    then begin
      flaggo:=false;
      flaggo2:=false;
      hidemouse;
      setvisualpage(page);
      page:=1-page;
      showmouse;
{      retrace;}
      WaitVBL;
      hidemouse;
      setactivepage(page);
      showmouse;

      if pereris[page]then
      begin
        showall(2);
        pereris[page]:=false;
      end;
      if flagradar[page]
      then begin
        setwsize(0,0,640,480);
        radar2;
        flagradar[page]:=false;
        setwsize(0,0,520,480);
      end;
      if newMoney[page]
      then begin
        panel(false);
        newMoney[page]:=false;
      end;

      if newPanel[page]
      then begin
        panel(true);
        newpanel[page]:=false;
      end;
      showall(0);
      if victory
      then begin
        borlandSetTextSize(2);
        setcolor(119);
        hidemouse;
        BorlandOutTextXY(50,230,'Вы выиграли!!!',GothP);
        showmouse;
        if timeToQuit>0
        then dec(timeToQuit)
        else begin
{          victory:=false;
          flagMenu:=true;
          newMenu[0]:=true;
          oldCursor:=cursor;
          cursor:=1;
          setCursor(cursor);}
        end;
      end;
      if failed
      then begin
        borlandSetTextSize(2);
        setcolor(119);
        hidemouse;
        BorlandOutTextXY(60,230,'Вы проиграли',GothP);
        showmouse;
        if timeToQuit>0
        then dec(timeToQuit)
        else begin
{          failed:=false;
          flagMenu:=true;
          newMenu[0]:=true;
          oldCursor:=cursor;
          cursor:=1;
          setCursor(cursor);}
        end;
      end;
  {    if Construction then}
      intellect;
      getevent(event);
      handleevent(event);
      putevent(cmFire);
      if (deleting^.elem<>nil) then begin
        repeat
          dispose(deleting^.last^.next,done);
        until (deleting^.elem=nil);
      end;
      if (key=#27)and not(flagChrono)
      then begin
        play('wav2.wav');
        flagMenu:=true;
        newMenu[0]:=true;
        setvisualpage(0);
        setactivepage(0);
        oldCursor:=cursor;
        cursor:=1;
        setCursor(cursor);
        if arrow<>0 then showmouse;
{        newMenu[1]:=true;}
      end;
      if (flagplay<>10000)
      then begin
        play2;
        flagplay:=10000;
      end;

    end
    else begin
      if newMenu[0]
      then begin
        newMenu[0]:=false;
        if (menu^.sost<>7)and(menu^.sost<>9)
        then begin
          setvisualpage(1);
          setactivepage(0);
          showall(1);
          if victory
          then begin
            borlandSetTextSize(2);
            setcolor(119);
            BorlandOutTextXY(50,230,'Вы выиграли!!!',GothP);
          end;
          if failed
          then begin
            borlandSetTextSize(2);
            setcolor(119);
            BorlandOutTextXY(60,230,'Вы проиграли',GothP);
          end;
        end;
        menu^.show;
        if (menu^.sost<>7)and(menu^.sost<>9)
        then setvisualpage(0);
      end;
      getevent(event);
      menu^.handleevent(event);
    end;
  until flagQuit{(key=#27)};
end;

procedure tDeskTop.createall;
begin
  sostb:=0;sostT:=0;sostA:=0;
  stB:=new(pStack,init);
  stT:=new(pStack,init);
  stA:=new(pStack,init);

  myhouse:=new(pGroup,Init);
  insert(myhouse);

  enemyhouse:=new(pGroup,Init);
  insert(enemyhouse);

  myTurret:=new(pGroup,Init);
  insert(myTurret);

  EnemyTurret:=new(pGroup,Init);
  insert(EnemyTurret);

  myrobot:=new(pGroup,Init);
  insert(myRobot);

  mytank:=new(pGroup,Init);
  insert(mytank);

  enemyRobot:=new(pGroup,Init);
  insert(enemyRobot);

  enemytank:=new(pGroup,Init);
  insert(enemytank);

  viborRobot:=new(pGroup,Init);
  insert(viborRobot);

  viborTank:=new(pGroup,Init);
  insert(viborTank);

  rocet2:=new(pgroup,init);
  insert(rocet2);

  myAir:=new(pGroup,Init);
  insert(myAir);

  enemyair:=new(pGroup,Init);
  insert(enemyAir);

  viborAir:=new(pGroup,Init);
  insert(viborAir);

  deleting:=new(pgroup,init);
  insert(deleting);

  smoke:=new(pgroup,init);
  insert(smoke);

  smoke2:=new(pgroup,init);
  insert(smoke2);

  rocet:=new(pgroup,init);
  insert(rocet);
end;

constructor tDeskTop.Init;
begin
  last:=nil;elem:=nil;owner:=nil;next:=nil;
  polex:=0;poley:=0;
  ScrollTime:=Time;
  FlagPressMouse:=false;
  flagramka:=false;
  flagbuildhouse:=false;
  otkogo:=nil;
  flagradar[0]:=false;flagradar[1]:=false;
  newpanel[0]:=true;newpanel[1]:=true;
  newMoney[0]:=false;newMoney[1]:=false;
  flagcloack:=false;
  flagBuildTank:=false;
  flagBuildAir:=false;
  remont:=false;
  flagTiberium:=0;
  arrow:=0;
  vibor:=false;
  flagShowMove:=false;
  TimeShowMove:=time14;

  createall;

  pgroup(myhouse)^.insert(new(pHouse,Init(2,2,massize[111,0],massize[111,1],111,0,1000,1000)));
  pgroup(myhouse)^.insert(new(pHouse,Init(15,15,massize[113,0],massize[113,1],113,0,1000,1000)));
  pgroup(myhouse)^.insert(new(pHouse,Init(3,8,massize[114,0],massize[114,1],114,0,300,500)));
  pgroup(myhouse)^.insert(new(pHouse,Init(9,7,massize[112,0],massize[112,1],112,0,400,500)));
  pgroup(myhouse)^.insert(new(pHouse,Init(15,19,massize[116,0],massize[116,1],116,0,400,500)));
  pgroup(myhouse)^.insert(new(pHouse,Init(3,13,massize[115,0],massize[115,1],115,0,500,1000)));

  pgroup(enemyhouse)^.insert(new(pHouse,Init(79,67,massize[121,0],massize[121,1],121,1,1400,1500)));
{  pgroup(enemyhouse)^.insert(new(pHouse,Init(80,70,massize[125,0],massize[125,1],125,1,400,500)));
  pgroup(enemyhouse)^.insert(new(pHouse,Init(85,70,massize[122,0],massize[122,1],122,1,400,500)));}
  pgroup(enemyhouse)^.insert(new(pHouse,Init(10,15,massize[126,0],massize[126,1],126,1,400,500)));

{  pgroup(myAir)^.insert(new(pAir,Init(80,78,80,78,80,78,0,0,500,500,0,0,31,4,75,75,1,0,false,2,0,
  240+80,20,5,nil,255,false)));}

{  pGroup(smoke)^.insert(new(pSmoke,init(200,200,10)));}
end;

procedure tDesktop.Show;
var pp:pObject;
begin
  pp:=last;
  repeat
    pp:=pp^.next;
    pp^.show;
  until pp=last
end;

destructor tDeskTop.done;
var pp:pObject;
begin
  dispose(stB,done);
  dispose(stT,done);
  dispose(stA,done);

  if elem<>nil
  then begin
    pp:=last;
    repeat
      pp:=elem^.next;
      dispose(pp,done);
    until (elem=nil);
  end;
{  last:=nil;}
end;

procedure tDeskTop.doneall;
begin
  done2(myhouse);
  done2(enemyhouse);
  done2(rocet2);
  done2(rocet);
  done2(myAir);
  done2(EnemyAir);
  done2(vibortank);
  done2(viborRobot);
  done2(ViborAir);
  done2(myRobot);
  done2(mytank);
  done2(enemyRobot);
  done2(enemytank);
  done2(smoke);
  done2(smoke2);
  done2(MyTurret);
  done2(EnemyTurret);
end;

procedure tDeskTop.done2(pp:pObject);
begin
  if pp^.elem<>nil
  then begin
{  pp:=last;}
    repeat
  {    pp:=pp^.next;}
      dispose(pp^.last^.next,done);
    until (pp^.elem=nil);
  end;
end;

procedure tDeskTop.save;
var s:string[32];
    w,ww:word;
    event2:tEvent;
begin
{  filename:='save1.sav';}
  assign(savefile,filename);
  rewrite(savefile,1);

{  fileStr:='aefdfafadfakjhjhgnhmghnfg';}
  blockwrite(savefile,fileStr,sizeof(s));

  blockwrite(savefile,polex,sizeof(polex));
  blockwrite(savefile,poley,sizeof(poley));

{  rocetstep:=2;}
  blockwrite(savefile,prioritet,sizeof(prioritet));
  blockwrite(savefile,rocetstep,sizeof(rocetstep));

  blockwrite(savefile,masTimeBuild,sizeof(masTimeBuild));
  blockwrite(savefile,masDam,sizeof(masDam));
  blockwrite(savefile,masPow,sizeof(masPow));
  blockwrite(savefile,masDis,sizeof(masDis));
  blockwrite(savefile,masTime,sizeof(masTime));

  blockwrite(savefile,pole,sizeof(pole));
  blockwrite(savefile,pole3,sizeof(pole3));

  s:='save constant';
  blockwrite(savefile,s,14);

  blockwrite(savefile,selHouse,sizeof(selHouse));
  blockwrite(savefile,sel,sizeof(sel));

{save constant's}
  blockwrite(savefile,masflagicon,sizeof(masflagicon));
  blockwrite(savefile,flagquit,sizeof(flagquit));
  blockwrite(savefile,newmenu,sizeof(newmenu));
  blockwrite(savefile,flagTiberium,sizeof(flagTiberium));
  blockwrite(savefile,flag67,sizeof(flag67));
  blockwrite(savefile,zahvat,sizeof(zahvat));
  blockwrite(savefile,attack,sizeof(attack));
  blockwrite(savefile,complet,sizeof(complet));
  blockwrite(savefile,patrol,sizeof(patrol));
  blockwrite(savefile,numberbuild,sizeof(numberbuild));
  blockwrite(savefile,maxbuild,sizeof(maxbuild));
  blockwrite(savefile,masflagBuild,sizeof(masflagBuild));
  blockwrite(savefile,masmyflagbuild,sizeof(masmyflagbuild));
  blockwrite(savefile,kolTank,sizeof(kolTank));
  blockwrite(savefile,kolair,sizeof(kolair));
  blockwrite(savefile,kolpatrol,sizeof(kolpatrol));
  blockwrite(savefile,inckol,sizeof(inckol));
  blockwrite(savefile,notiberium,sizeof(notiberium));
  blockwrite(savefile,flagnewbuild,sizeof(flagnewbuild));
  blockwrite(savefile,construction,sizeof(construction));
  blockwrite(savefile,money,sizeof(money));
  blockwrite(savefile,flagMenu,sizeof(flagmenu));
  blockwrite(savefile,flagquit,sizeof(flagquit));
  blockwrite(savefile,failed,sizeof(failed));
  blockwrite(savefile,victory,sizeof(victory));
{end save constan's}

  s:='save desktop';
  blockwrite(savefile,s,13);
{save desktop}
  inherited save;
  blockwrite(savefile,scrolltime,sizeof(scrolltime));
  blockwrite(savefile,rasbuild,sizeof(rasbuild));
  blockwrite(savefile,tipbuild,sizeof(tipbuild));
{надо настроить}  blockwrite(savefile,otkogo,sizeof(otkogo));
  blockwrite(savefile,oldmousex,sizeof(oldmousex));
  blockwrite(savefile,oldmousey,sizeof(oldmousey));
  blockwrite(savefile,mousex1,sizeof(mousex1));
  blockwrite(savefile,mousey1,sizeof(mousey1));
  blockwrite(savefile,mousex2,sizeof(mousex2));
  blockwrite(savefile,mousey2,sizeof(mousey2));
  blockwrite(savefile,flagbuildhouse,sizeof(flagbuildhouse));
  blockwrite(savefile,flagramka,sizeof(flagramka));
  blockwrite(savefile,flagpressmouse,sizeof(flagpressmouse));
{      stB,stT,stA:pStack;}
{  blockwrite(savefile,stb,sizeof(stb));
  blockwrite(savefile,stt,sizeof(stb));
  blockwrite(savefile,sta,sizeof(stb));}
  blockwrite(savefile,flagbuildtank,sizeof(flagbuildtank));
  blockwrite(savefile,flagbuildair,sizeof(flagbuildair));
  blockwrite(savefile,timebuildh,sizeof(timebuildh));
  blockwrite(savefile,tbuildh,sizeof(tbuildh));
  blockwrite(savefile,timebuildT,sizeof(timebuildt));
  blockwrite(savefile,tbuildT,sizeof(tbuildT));
  blockwrite(savefile,timebuilda,sizeof(timebuilda));
  blockwrite(savefile,tbuilda,sizeof(tbuilda));
{надо настроить}  blockwrite(savefile,builder,sizeof(builder));
{  blockwrite(savefile,menu,sizeof(menu));}
{      menu:pMenu;}
  blockwrite(savefile,xm2,sizeof(xm2));
  blockwrite(savefile,ym2,sizeof(ym2));
  blockwrite(savefile,arrow,sizeof(arrow));
  blockwrite(savefile,vibor,sizeof(vibor));
  blockwrite(savefile,tarx,sizeof(tarx));
  blockwrite(savefile,tary,sizeof(tary));
  blockwrite(savefile,flagshowmove,sizeof(flagshowmove));
  blockwrite(savefile,timeshowmove,sizeof(timeshowmove));
  blockwrite(savefile,showmove,sizeof(showmove));
{end save desktop}

{save all stek}
  blockwrite(savefile,sostB,sizeof(sostB));
  blockwrite(savefile,sostT,sizeof(sostT));
  blockwrite(savefile,sostA,sizeof(sostA));
  stB^.save;
  stT^.save;
  stA^.save;
{and save stek}

{save menu}
  menu^.save;
{end save menu}

  event2.watch:=cmEvent;
  event2.code:=cmSave;
  message(myhouse,event2);
  message(enemyhouse,event2);
  message(myturret,event2);
  message(enemyturret,event2);
  message(mytank,event2);
  message(enemyRobot,event2);
  message(enemytank,event2);
  message(myRobot,event2);
  message(vibortank,event2);
  message(rocet2,event2);
  message(myair,event2);
  message(enemyair,event2);
  message(viborair,event2);
{  message(deleting,event2);}
  message(smoke,event2);
  message(smoke2,event2);
  message(rocet,event2);

  close(savefile);

  event2.watch:=cmEvent;
  event2.code:=cmRestore;
  message(menu,event2);
end;

procedure tDeskTop.load2;
var s:string[32];
    w,ww:word;
    event2:tevent;
    i,num:integer;
begin
{$I-}
{  filename:='save1.sav';}
  assign(loadfile,filename);
  reset(loadfile,1);
  if IOResult<>0
  then exit;
{$I+}
  flagLoadfile:=true;
  doneall;
{  createall;}
  blockread(loadfile,s,sizeof(s));

  blockread(loadfile,polex,sizeof(polex));
  blockread(loadfile,poley,sizeof(poley));

  blockread(loadfile,prioritet,sizeof(prioritet));
  blockread(loadfile,rocetstep,sizeof(rocetstep));

  blockread(loadfile,masTimeBuild,sizeof(masTimeBuild));
  blockread(loadfile,masDam,sizeof(masDam));
  blockread(loadfile,masPow,sizeof(masPow));
  blockread(loadfile,masDis,sizeof(masDis));
  blockread(loadfile,masTime,sizeof(masTime));

  blockread(loadfile,pole,sizeof(pole));
  blockread(loadfile,pole3,sizeof(pole3));

  blockread(loadfile,s,14);

  blockread(loadfile,selHouse,sizeof(selHouse));
  blockread(loadfile,sel,sizeof(sel));
{load constant's}
  blockread(loadfile,masflagicon,sizeof(masflagicon));
  blockread(loadfile,flagquit,sizeof(flagquit));
  blockread(loadfile,newmenu,sizeof(newmenu));
  blockread(loadfile,flagTiberium,sizeof(flagTiberium));
  blockread(loadfile,flag67,sizeof(flag67));
  blockread(loadfile,zahvat,sizeof(zahvat));
  blockread(loadfile,attack,sizeof(attack));
  blockread(loadfile,complet,sizeof(complet));
  blockread(loadfile,patrol,sizeof(patrol));
  blockread(loadfile,numberbuild,sizeof(numberbuild));
  blockread(loadfile,maxbuild,sizeof(maxbuild));
  blockread(loadfile,masflagBuild,sizeof(masflagBuild));
  blockread(loadfile,masmyflagbuild,sizeof(masmyflagbuild));
  blockread(loadfile,kolTank,sizeof(kolTank));
  blockread(loadfile,kolair,sizeof(kolair));
  blockread(loadfile,kolpatrol,sizeof(kolpatrol));
  blockread(loadfile,inckol,sizeof(inckol));
  blockread(loadfile,notiberium,sizeof(notiberium));
  blockread(loadfile,flagnewbuild,sizeof(flagnewbuild));
  blockread(loadfile,construction,sizeof(construction));
  blockread(loadfile,money,sizeof(money));
  blockread(loadfile,flagMenu,sizeof(flagmenu));
  blockread(loadfile,flagquit,sizeof(flagquit));
  blockread(loadfile,failed,sizeof(failed));
  blockread(loadfile,victory,sizeof(victory));
{end load constan's}

  blockread(loadfile,s,13);

{load desktop}
  inherited load2;
  blockread(loadfile,scrolltime,sizeof(scrolltime));
  blockread(loadfile,rasbuild,sizeof(rasbuild));
  blockread(loadfile,tipbuild,sizeof(tipbuild));
{надо настроить}  blockread(loadfile,otkogo,sizeof(otkogo));
  blockread(loadfile,oldmousex,sizeof(oldmousex));
  blockread(loadfile,oldmousey,sizeof(oldmousey));
  blockread(loadfile,mousex1,sizeof(mousex1));
  blockread(loadfile,mousey1,sizeof(mousey1));
  blockread(loadfile,mousex2,sizeof(mousex2));
  blockread(loadfile,mousey2,sizeof(mousey2));
  blockread(loadfile,flagbuildhouse,sizeof(flagbuildhouse));
  blockread(loadfile,flagramka,sizeof(flagramka));
  blockread(loadfile,flagpressmouse,sizeof(flagpressmouse));
{      stB,stT,stA:pStack;}
{  blockread(loadfile,stb,sizeof(stb));
  blockread(loadfile,stt,sizeof(stb));
  blockread(loadfile,sta,sizeof(stb));}
  blockread(loadfile,flagbuildtank,sizeof(flagbuildtank));
  blockread(loadfile,flagbuildair,sizeof(flagbuildair));
  blockread(loadfile,timebuildh,sizeof(timebuildh));
  blockread(loadfile,tbuildh,sizeof(tbuildh));
  blockread(loadfile,timebuildT,sizeof(timebuildt));
  blockread(loadfile,tbuildT,sizeof(tbuildT));
  blockread(loadfile,timebuilda,sizeof(timebuilda));
  blockread(loadfile,tbuilda,sizeof(tbuilda));
{надо настроить}  blockread(loadfile,builder,sizeof(builder));
{  blockread(loadfile,menu,sizeof(menu));}
{      menu:pMenu;}
  blockread(loadfile,xm2,sizeof(xm2));
  blockread(loadfile,ym2,sizeof(ym2));
  blockread(loadfile,arrow,sizeof(arrow));
  blockread(loadfile,vibor,sizeof(vibor));
  blockread(loadfile,tarx,sizeof(tarx));
  blockread(loadfile,tary,sizeof(tary));
  blockread(loadfile,flagshowmove,sizeof(flagshowmove));
  blockread(loadfile,timeshowmove,sizeof(timeshowmove));
  blockread(loadfile,showmove,sizeof(showmove));
{end load desktop}

{load all stek}
  blockread(loadfile,sostB,sizeof(sostB));
  blockread(loadfile,sostT,sizeof(sostT));
  blockread(loadfile,sostA,sizeof(sostA));
  stB^.load2;
  stT^.load2;
  stA^.load2;
{and load stek}

{load menu}
  menu^.load2;
{end load menu}

  event2.watch:=cmEvent;
  event2.code:=cmLoadf;

  blockread(loadfile,s,10);
  blockread(loadfile,num,sizeof(num));
  newOb(myhouse,cmNewhouse,num);
  message(myhouse,event2);

  blockread(loadfile,s,10);
  blockread(loadfile,num,sizeof(num));
  newOb(enemyhouse,cmNewhouse,num);
  message(enemyhouse,event2);

  blockread(loadfile,s,10);
  blockread(loadfile,num,sizeof(num));
  newOb(myTurret,cmNewtank,num);
  message(myturret,event2);

  blockread(loadfile,s,10);
  blockread(loadfile,num,sizeof(num));
  newOb(enemyTurret,cmNewtank,num);
  message(enemyturret,event2);

  blockread(loadfile,s,10);
  blockread(loadfile,num,sizeof(num));
  newOb(myTank,cmNewtank,num);
  message(mytank,event2);

  blockread(loadfile,s,10);
  blockread(loadfile,num,sizeof(num));
  newOb(enemyRobot,cmNewRobot,num);
  message(enemyRobot,event2);

  blockread(loadfile,s,10);
  blockread(loadfile,num,sizeof(num));
  newOb(enemyTank,cmNewtank,num);
  message(enemytank,event2);

  blockread(loadfile,s,10);
  blockread(loadfile,num,sizeof(num));
  newOb(myRobot,cmNewRobot,num);
  message(myRobot,event2);

  blockread(loadfile,s,10);
  blockread(loadfile,num,sizeof(num));
  newOb(ViborTank,cmNewtank,num);
  message(vibortank,event2);

  blockread(loadfile,s,10);
  blockread(loadfile,num,sizeof(num));
  newOb(rocet2,cmNewRoc2,num);
  message(rocet2,event2);

  blockread(loadfile,s,10);
  blockread(loadfile,num,sizeof(num));
  newOb(myair,cmNewAir,num);
  message(myair,event2);

  blockread(loadfile,s,10);
  blockread(loadfile,num,sizeof(num));
  newOb(enemyair,cmNewAir,num);
  message(enemyair,event2);

  blockread(loadfile,s,10);
  blockread(loadfile,num,sizeof(num));
  newOb(viborair,cmNewAir,num);
  message(viborair,event2);

{  message(deleting,event2);}

  blockread(loadfile,s,10);
  blockread(loadfile,num,sizeof(num));
  newOb(smoke,cmNewSm,num);
  message(smoke,event2);

  blockread(loadfile,s,10);
  blockread(loadfile,num,sizeof(num));
  newOb(smoke2,cmNewSm,num);
  message(smoke2,event2);

  blockread(loadfile,s,10);
  blockread(loadfile,num,sizeof(num));
  newOb(rocet,cmNewroc,num);
  message(rocet,event2);

{проверка на конец файла (w=0 - yes!!!)}
{  blockread(loadfile,num,sizeof(num),w);}
  close(loadfile);

  nastroika(otkogo,myhouse);
  nastroika(selhouse,myhouse);
  nastroika(sel,myhouse);

  event2.watch:=cmevent;
  event2.code:=cmRestore;
  message(myhouse,event2);
  message(enemyhouse,event2);
  message(myturret,event2);
  message(enemyturret,event2);
  message(mytank,event2);
  message(enemytank,event2);
  message(enemyRobot,event2);
  message(myRobot,event2);
  message(vibortank,event2);
  message(rocet2,event2);
  message(myair,event2);
  message(enemyair,event2);
  message(viborair,event2);
  message(smoke,event2);
  message(smoke2,event2);
  message(rocet,event2);

  nastroika(builder,enemyHouse);
  hidemouse;
{  newMoney[0]:=true;
  newMoney[1]:=true;}
  newpanel[0]:=true;
  newpanel[1]:=true;
  pereris[0]:=true;
  pereris[1]:=true;
  show2;

  flagLoadfile:=false;

  flagmenu:=true;
  newmenu[0]:=true;
  menu^.sost:=0;
  Cursor:=1;
  oldCursor:=0;
  setCursor(cursor);
  flagCursor:=0;
  oldflagCursor:=1;
end;

procedure tDeskTop.newob(p:pObject;cod:word;zzz:integer);
var i:integer;
    event2:tEvent;
begin
  event2.watch:=cmevent;
  event2.code:=cod;
  event2.otkogo:=p;
  for i:=1 to zzz do
    message(desk,event2);
end;

{***************************Program****************************************}
var
  pp:pObject;
  long:longint;
  s:string;
  size:word;
  f:file;
  p:pointer;
  init:boolean;
  i:integer;
  pos:longint;

begin
{  repeat
    if endingplay then play('shot.wav');
  until keypressed;}

  quit:=false;
  long:=memavail;
  randomize;
  sel:=nil;selhouse:=nil;
  fff:=false;sel:=nil;selhouse:=nil;
  initmas;
  initall;
  loadpict;
  palet:=new(pPalet,init);
  menu:=new(pMenu,init);
  stroka:=new(pStr,init);

{  resetMouseCursor;}
  repeat
    sel:=nil;selhouse:=nil;
    fff:=false;sel:=nil;selhouse:=nil;
    initpole(pole,pole3);

    timeToQuit:=150;
    Cursor:=1;
    oldCursor:=0;
    setCursor(cursor);
    flagCursor:=0;
    oldflagCursor:=1;
    chronoCur:=false;

    desk:=new(pDeskTop,Init);
    pDeskTop(desk)^.run;
    dispose(desk,done);
{    desk^.done;}

    hidemouse;

    prioritet:=30;
    rocetstep:=40;
    initmas;
    fillchar(number,sizeOF(number),0);
    fillchar(maxnumber,sizeOF(maxnumber),0);

    flagQuit:=false;
    newMenu[0]:=true;
    flagTiberium:=0;
    flag67:=false;
    zahvat:=false;{нечто, связанное с захватом ресурсов}
    attack:=false;{атака}
    complet:=true;
    patrol[0]:=true;
    patrol[1]:=true;
    fillchar(numberBuild,sizeOF(numberBuild),0);
    fillchar(maxBuild,sizeOF(maxBuild),0);
    maxbuild[122]:=1;
    maxbuild[123]:=1;
    maxbuild[124]:=1;
    maxbuild[125]:=5;
    masflagbuild[121]:=true;
    masflagbuild[122]:=false;
    masflagbuild[123]:=false;
    masflagbuild[124]:=false;
    masflagbuild[125]:=true;
    masflagbuild[126]:=false;
    masMyflagbuild[111]:=true;
    masMyflagbuild[112]:=false;
    masMyflagbuild[113]:=false;
    masMyflagbuild[114]:=false;
    masMyflagbuild[115]:=true;
    masMyflagbuild[116]:=false;
    masMyflagbuild[117]:=false;
    masMyflagbuild[118]:=false;
    koltank:=5;
    kolAir:=5;
    kolpatrol[0]:=10;kolpatrol[1]:=10;
    incKol[0]:=5;incKol[1]:=5;
    noTiberium:=false;
    flagNewBuild:=false;
    Construction:=false;
    Money[0]:=9000;Money[1]:=9000;
    flagMenu:=true;
    menu^.sost:=4;
    flagQuit:=false;
    failed:=false;
    victory:=false;
    flagLoadfile:=false;
{    flagMenu:=false;}
  until quit;

  dispose(palet,done);
  dispose(menu,done);
  dispose(stroka,done);

  setcolor(white);
  str(long-memavail,s);
  outtextxy(50,50,s);
  setactivepage(1-page);
  outtextxy(50,50,s);
  if long-memavail<>0
  then begin
    sound(500);
    readkey;
    nosound;
  end;
  doneall;
end.
