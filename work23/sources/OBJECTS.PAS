{$A+,B-,D+,E+,F+,G-,I+,L+,N-,O-,P-,Q+,R+,S+,T-,V+,X+}
{$M 16384,0,655360}
unit Objects;
interface
  procedure Ramka;
  Procedure DrawWindow(x1,y1,x2,y2:integer;var hand:word);
  Procedure ShowWindow(x1,y1,x2,y2:integer;var hand:word);
  procedure InitAll;
  procedure DoneAll;
  procedure DrawButton(x1,y1,x2,y2:word;s:string;press,focus:boolean);
  function LoadSpr(s:string):pointer;
  function LoadSpr1(var f:file):pointer;
implementation
uses
  vx,crt,ems,resourse;

var
  oldptr:pointer;

procedure DoneAll;
begin
  VXMouseDone;
  VesaDone;
  DoneEms;
  if OldPtr<>ExitProc
    then
      begin
        ExitProc:=OldPtr;
        Halt(ExitCode);
      end;
end;

procedure InitAll;
begin
  InitEms;
  VesaInit(M640x480);
  VXMouseInit;
  BorlandFontInit;
  oldptr:=ExitProc;
  exitproc:=@DoneAll;
end;

function LoadSpr(s:string):pointer;
var
  f:file;
  len:word;
  t:pointer;
  res:word;
begin
  Assign(f,s);
  Reset(f,1);
  len:=FileSize(f);
  GetMem(t,len);
  BlockRead(f,t^,len,res);
  LoadSpr:=LoadSprite(t);
  FreeMem(t,len);
  close(f);
end;

function LoadSpr1(var f:file):pointer;
var
  len:word;
  t:pointer;
  res:word;
  x,y:word;
begin
  BlockRead(f,x,2);
  BlockRead(f,y,2);
  BlockRead(f,len,2);
  Inc(len,6);
  Seek(f,FilePos(f)-6);
  GetMem(t,len);
  BlockRead(f,t^,len,res);
  if Res<>Len
    then
      begin
        DoneAll;
        Writeln('Incorrect file format.');
        Halt(0);
      end;
  LoadSpr1:=LoadSprite(t);
  FreeMem(t,len);
end;

procedure Ramka;
var i:integer;
    p:pointer;
begin
  p:=@hor;
  Inc(Longint(p),6);
  for i:=1 to 58 do
    PutImage(i*8,0,p,NormalPut);
  for i:=1 to 58 do
    PutImage(i*8,464+8,p,NormalPut);
  p:=@vert;
  Inc(Longint(p),6);
  for i:=1 to 58 do
    PutImage(0,i*8,p,NormalPut);
  for i:=1 to 58 do
    PutImage(464+8,i*8,p,NormalPut);
  p:=@sqr_;
  Inc(Longint(p),6);
  PutImage(0,0,p,NormalPut);
  PutImage(0,464+6,p,NormalPut);
  PutImage(464+6,0,p,NormalPut);
  PutImage(464+6,464+6,p,NormalPut);
end;

Procedure DrawWindow(x1,y1,x2,y2:integer;var hand:word);
var
  p:pointer;
begin
{  SaveWindow(x1,y1,x2,y2,hand);}
  SetColor(27);
  SetTexture(@Text_2);
  SetWriteMode(TexturePut);
  Rectangle(x1+1,y1+1,x2-1,y2-1,0,0);
  Rectangle(x1+2,y1+2,x2-2,y2-2,0,0);
  Rectangle(x1+3,y1+3,x2-3,y2-3,0,0);
  Rectangle(x1+4,y1+4,x2-4,y2-4,0,0);
  Rectangle(x1+5,y1+5,x2-5,y2-5,0,0);
  Rectangle(x1+6,y1+6,x2-6,y2-6,0,0);
  Rectangle(x1+7,y1+7,x2-7,y2-7,0,0);
  Rectangle(x1+8,y1+8,x2-8,y2-8,0,0);
  Rectangle(x1+9,y1+9,x2-9,y2-9,0,0);
  SetWriteMode(NormalPut);
  Rectangle(x1,y1,x2,y2,20,37);
  p:=@vint;
  Inc(Longint(p),6);
  PutImage(x1+2,y1+2,p,X0Put);
  PutImage(x1+2,y2-10,p,X0Put);
  PutImage(x2-10,y1+2,p,X0Put);
  PutImage(x2-10,y2-10,p,X0Put);
  Rectangle(x1+10,y1+10,x2-10,y2-10,37,23);
  Rectangle(x1+11,y1+11,x2-11,y2-11,23,37);
  Rectangle(x1+12,y1+12,x2-12,y2-12,20,37);
  SetTexture(@Text1);
  SetWriteMode(TexturePut);
  Bar(x1+13,y1+13,x2-13,y2-13);
  SetWriteMode(NormalPut);
end;

Procedure ShowWindow(x1,y1,x2,y2:integer;var hand:word);
var
  p:pointer;
begin
{  SaveWindow(x1,y1,x2,y2,hand);}
  SetWriteMode(NormalPut);
  Rectangle(x1+1,y1+1,x2-1,y2-1,21,37);
  SetWriteMode(TexturePut);
  SetTexture(@Text_4);
  Rectangle(x1+2,y1+2,x2-2,y2-2,23,37);
  Rectangle(x1+3,y1+3,x2-3,y2-3,23,37);
  Rectangle(x1+4,y1+4,x2-4,y2-4,23,37);
  Rectangle(x1+5,y1+5,x2-5,y2-5,23,37);
  Rectangle(x1+6,y1+6,x2-6,y2-6,23,37);
  Rectangle(x1+7,y1+7,x2-7,y2-7,23,37);

  SetWriteMode(ShadowPut);
  Bar(x1+9,y1+9,x2-9,y2-9);
  SetWriteMode(NormalPut);
  Rectangle(x1+8,y1+8,x2-8,y2-8,37,21);

  SetWriteMode(TexturePut);
  Bar(x1,y1,x1+9,y1+9);
  Bar(x1,y2-9,x1+9,y2);
  Bar(x2-9,y1,x2,y1+9);
  Bar(x2-9,y2-9,x2,y2);
  SetWriteMode(NormalPut);
  Rectangle(x1,y1,x1+9,y1+9,21,37);
  Rectangle(x1,y2-9,x1+9,y2,21,37);
  Rectangle(x2-9,y1,x2,y1+9,21,37);
  Rectangle(x2-9,y2-9,x2,y2,21,37);
  SetWriteMode(NormalPut);
  p:=@Sqr_1;
  Inc(Longint(p),6);
  PutImage(x1+1,y1+1,p,X0Put);
  PutImage(x1+1,y2-8,p,X0Put);
  PutImage(x2-8,y1+1,p,X0Put);
  PutImage(x2-8,y2-8,p,X0Put);
end;

procedure DrawButton(x1,y1,x2,y2:word;s:string;press,focus:boolean);
var
  y3,x3,ys,Ampl,value,i,x1_,x2_:integer;
  y,r:integer;
  Border:byte;
  step:integer;
  startcolor,Len:byte;
begin
  ys:=(y1+y2) div 2;
  Ampl:=(y2-y1) div 2;
  r:=(y2-y1+1) div 2;
  if focus
  then Border:=4
  else Border:=42;
  if press
  then startcolor:=21
  else startcolor:=20;
  step:=(y2-y1+1) div 15;
  setwriteMode(X0Put);
  for i:=y1 to y2 do
    begin
      if i<ys
      then y:=r-(i-y1)
      else y:=i-((y1+y2) div 2);
      value:=Round(Sqrt(Sqr(r)-Sqr(y)));
      SetColor(Border);
      x1_:=x1+Ampl-value;
      x2_:=x2-Ampl+value;
      if (i=y1)or(i=y2)
      then continue;
      Line(x1_,i,x1_+1,i);
      Line(x2_-1,i,x2_,i);
      if ((i-2)<y1) or ((i+2)>y2)
      then SetColor(Border)
      else SetColor(startcolor+((i-y1) div step));
      Line(x1_+2,i,x2_-2,i);
    end;
  if Not (Press)
  then SetColor(15)
  else SetColor(10);
  SetWriteMode(ShadowPut);
  Len:=Length(s);
  X3:=(x1+x2-Len*8) div 2;
  Y3:=(y1+y2-16) div 2;
  OutTextXY((x3),y3+1,s);
  OutTextXY((x3)+1,y3,s);
  OutTextXY((x3)+1,y3+1,s);
  SetWriteMode(NormalPut);
  OutTextXY((x3)+Byte(press),Y3+Byte(press),s);
end;

{procedure RestoreWindow - In VX module}

begin
end.