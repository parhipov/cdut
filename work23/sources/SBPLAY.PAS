{Программа проигрования музыки на SoundBlaster}
unit sbplay;
interface
Uses Crt,Dos;
const
     flagSound:boolean=true;
Type tHead=record
            Len,Speed:word;
            Data:byte;
           end;

var EndingPlay:boolean;
procedure Play(Name:string);
procedure DoneSPB;

implementation
const Lenn=4096;
      Lenn2=Lenn div 2;
Var SBTemp:Array[0..7] Of Word;  {Массив для временных данных}
    IRQNum:Byte;                 {Hомер прерывания SB}
    SBAdr:Word;                  {Базовый адрес SB}
    DMANum:Byte;                 {Hомер канала DMA}
    pData,pHead:Pointer;
    f:File;
    i,a,b:Byte;
    as,ao:Word;

    iqsb:Pointer;
    NumRead:Word;

Procedure WriteDSP(Value:byte); {Процедура записи в DSP SB}
Begin
     While Port[SBAdr+$C] And $80<>0 Do;
     Port[SBAdr+$C]:=Value;
End;

{Функция инициализации SB, при неудаче возвращает False, при удаче True}
Function ResetDSP(Base:Word):Boolean;
Begin
     Port[Base+$6]:=1;
     Delay(10);
     Port[Base+$6]:=0;
     Delay(10);
     If (Port[Base+$E] And $80=$80) And (Port[Base+$A]=$AA) Then
        ResetDSP:=True Else ResetDSP:=False;
End;

Procedure SetStereo; Assembler;
Asm
{   Mov DX,224h
   Mov AL,$E
   Out DX,AL
   Inc DX
   In  AL,DX
   And AL,253
   Or  AL,2
   Out DX,AL}

   Mov DX,224h
   Mov AL,$0
   Out DX,AL
   Inc DX
   mov al,0FFh
   Out DX,AL
   dec dx
   Mov AL,$04
   Out DX,AL
   Inc DX
   mov al,0FFh
   Out DX,AL
   dec dx
   Mov AL,$0A
   Out DX,AL
   Inc DX
   mov al,0h
   Out DX,AL
   dec dx
   Mov AL,$0c
   Out DX,AL
   Inc DX
   mov al,026h
   Out DX,AL
   dec dx
   Mov AL,$0e
   Out DX,AL
   Inc DX
   mov al,020h
   Out DX,AL
   dec dx
   Mov AL,$022
   Out DX,AL
   Inc DX
   mov al,99h
   Out DX,AL
   dec dx
   Mov AL,$026
   Out DX,AL
   Inc DX
   mov al,00h
   Out DX,AL
   dec dx
   Mov AL,$028
   Out DX,AL
   Inc DX
   mov al,0h
   Out DX,AL
   dec dx
   Mov AL,$02e
   Out DX,AL
   Inc DX
   mov al,0h
   Out DX,AL
End;

var Time_Constant:Word;

Procedure Playback(Sound:Pointer; Size:Word; Frequency:Word);
Var
    Page,Offset:Word;
Begin
     WriteDSP($D1);  {Включить динамик}

     Size:=Size-1;

(*     WriteDSP($48);  {Длина данных}
     WriteDSP(Lo(Size));  {Длина данных}
     WriteDSP(Hi(Size));  {Длина данных}*)


  { Set up the DMA chip }
     Offset:=Seg(Sound^) Shl 4+Ofs(Sound^);
     Page:=(Seg(Sound^)+Ofs(Sound^) Shr 4) Shr 12;

     Port[$0A]:=5;  {Регистр маски, канал 1, сбросить маску}
     Port[$0C]:=0;  {Сброс триггера байтов}
     Port[$0B]:=$59;  {Регистр режима, канал 1, автоинициализация}
     Port[$02]:=Lo(Offset); {Базовый адрес передаваемых данных канала 1}
     Port[$02]:=Hi(Offset); {Старший байт канала 1}
     Port[$83]:=Page;  {Регистр страний канала 1}
     Port[$03]:=Lo(Size); {Счетчик канала 1, младший байт}
     Port[$03]:=Hi(Size); {Старшый байт}
     Port[$0A]:=1;  {Установить маску канала 1}

  { Set the playback frequency }
     Time_Constant:=256-(1000000 Div frequency);
     WriteDSP($40);
     WriteDSP(Time_Constant);
(*     WriteDSP($41);
     WriteDSP(Hi(frequency));
     WriteDSP(Lo(frequency));*)

  { Set the playback type autoinit (8-bit) }
     WriteDSP($1C);
End;

Type tProc=function (var Size:word):boolean;
Var pp:tProc;

function LoadFile (var Size:word):boolean;
begin

end;


Procedure IRQHandler(flags, cs,ip,ax,bx,cx,dx,si,di,ds,es,bp:Word); Interrupt;
Begin
     SBTemp[0]:=Port[SBAdr+$E]; {Сброс звуковой карты}
(*     WriteDSP($40);
     WriteDSP(Time_Constant);
     WriteDSP($D1);  {Включить динамик}*)
  { Set the playback type autoinit (8-bit) }
{     Write('.');}
     If i=2 Then
     Begin
          if Eof(f)
          then begin
                 EndingPlay:=true;
                 Close(f);
                 ReSetDsp($220);
               end
          else begin
                BlockRead(f,Mem[as:ao+LenN2],LenN2,NumRead);
                i:=1;
                WriteDSP($48);  {Длина данных}
                dec(NumRead);
                WriteDSP(Lo(NumRead));  {Длина данных}
                WriteDSP(Hi(NumRead));  {Длина данных}
                WriteDSP($1C);
              end;
          Port[$20]:=$20;   {Сбрасуем контроллер прерываний}
          Exit;
     End;
     If i=1 Then
     Begin
          if EOF(F)
          then begin
                 EndingPlay:=true;
                 Close(f);
                 ReSetDsp($220);
               end
          else begin
                 BlockRead(f,Mem[as:ao],LenN2,NumRead);
(*          If NumRead=0 Then
          Begin
             {  FillChar(Mem[as:ao+NumRead],LenN2-NumRead,0);}
               EndingPlay:=true;
          End;*)
                 WriteDSP($48);  {Длина данных}
                 dec(NumRead);
                 WriteDSP(Lo(NumRead));  {Длина данных}
                 WriteDSP(Hi(NumRead));  {Длина данных}
                 i:=2;WriteDSP($1C);
               end;
          Port[$20]:=$20;   {Сбрасуем контроллер прерываний}
          Exit;
     End;
     Port[$20]:=$20;   {Сбрасуем контроллер прерываний}
End;

Type HeadWAVE=record
               IDHead:array[0..3] of char;
               Len:longint;
               IDWAVE:array[0..3] of char;
               WaveForm:array[0..3] of char;
               XX:longint;
               YY:word;
               NCanal:word;
               Freq:word;
               Freq2:word;
             end;

procedure Play(Name:string);
var
    LenData:word;
Begin
     if not(flagSound)
     then
      exit;
     if EndingPlay=false
     then begin
            Asm
               Cli
               In  AL,21h
               Mov CL,0100000b
               or  AL,CL
               Out 21h,AL
               Sti
            End;
            ResetDSP($220);
            close(f);
          end;
     sbAdr:=$220;EndingPlay:=false;
     i:=1;

     Assign(f,Name);
     ReSet(f,1);
     as:=Seg(pData^);
     ao:=Ofs(pData^);

     BlockRead(f,pHead^,58);
     BlockRead(f,pData^,LenN,LenData);
     Asm
        Cli
        In  AL,21h
        Mov CL,1011111b
        And AL,CL
        Out 21h,AL
        Sti
     End;
     SetStereo;
     PlayBack(pData,LenData,HeadWAVE(pHead^).Freq); {22050}
end;

procedure DoneSPB;
begin
     Asm
        Cli
        In  AL,21h
        Mov CL,0100000b
        or  AL,CL
        Out 21h,AL
        Sti
     End;
     ReSetDsp($220);
     SetIntVec(5+8,iqsb);
end;


begin
   flagSound:=resetDSP($220);
   EndingPlay:=true;
   GetIntVec(5+8,iqsb);
   SetIntVec(5+8,@IRQHandler);
   system.GetMem(pHead,58);
   system.GetMem(pData,LenN);
End.