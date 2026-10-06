{$A+,B-,D+,E+,F-,G-,I+,L+,N-,O-,P-,Q+,R+,S+,T-,V+,X+,Y+}
{$M 16384,0,655360}
unit palitra;
interface
uses crt,modul,objec2;
type PaletteType=array[0..255,0..2] of byte;
    pPalet=^tPalet;
    tPalet=object(tObject)
      Pal:PaletteType;
      destructor done;virtual;
      constructor init;
      procedure palette(f:byte);
      procedure handleEvent(var event:tEvent);virtual;
    end;

{procedure palette(f:byte);
procedure getpalette(var pal:PaletteType);}
implementation

procedure GetPal(i:WORD;var p);
begin
  asm
    mov ax,1015h
    mov bx,i
    int 10h
    les di,dword ptr p
    mov byte ptr es:[di],dh
    mov byte ptr es:[di+1],ch
    mov byte ptr es:[di+2],cl
  end
end;

procedure GetPalette(var Pal:PaletteType);
var i:integer;
begin
  for i:=0 to 255 do
    GetPal(i,pal[i])
end;
procedure SetAllPalette(var p);
begin
  asm
   mov ax,1012h
   xor bx,bx
   mov cx,0ffh
   les dx, dword ptr p
   int 10h
  end;
end;
procedure IncPalette(i:word);
begin
  asm
    mov ax,1015h
    mov bx,i
    int 10h
    cmp ch,63
    jae @e
    inc ch
@e: cmp cl,63
    jae @r
    inc cl
@r: cmp dh,63
    jae @t
    inc dh
@t: mov ax,1010h
    mov bx,i
    int 10h
  end;

end;

{******************************Palette**************************************}
destructor tPalet.done;
begin
  inherited done;
end;

constructor tPalet.init;
var f:file;
    size:word;
begin
  assign(f,'vx.pal');
  reset(f,1);
  blockread(f,pal,sizeof(pal),size);
  close(f);
end;

procedure tPalet.palette(f:byte);
procedure pp(p:PaletteType);
var k,i,j:integer;
    p2:paletteType;
begin
  case f of
    0:begin
        for j:=0 to 63 do
        begin
          for i:=0 to 255 do
            for k:=0 to 2 do
            begin
              if p[i,k]<63then inc(p[i,k]);
              if p[i,k]<63then inc(p[i,k]);
            end;
          waitVBL;
          setAllpalette(p);
        end;
      end;
    1:begin
        for i:=0 to 255 do
          for k:=0 to 2 do
            p2[i,k]:=63;
        for j:=0 to 63 do
        begin
          for i:=0 to 255 do
            for k:=0 to 2 do
            begin
              if (p2[i,k]>pal[i,k]) then dec(p2[i,k]);
{              if (p2[i,k]>pal[i,k]) then dec(p2[i,k]);}
            end;
          waitVBL;
          setAllpalette(p2);
        end;
      end;
    2:begin
        for j:=0 to 63 do
        begin
          for i:=0 to 255 do
            for k:=0 to 0 do
            begin
              if p[i,k]<63 then inc(p[i,k]);
              if p[i,k]<63 then inc(p[i,k]);
            end;
          waitVBL;
          setAllpalette(p);
        end;
      end;
    3:begin
        p2:=pal;
        for i:=0 to 255 do
          for k:=0 to 0 do
            p2[i,k]:=63;
        for j:=0 to 63 do
        begin
          for i:=0 to 255 do
            for k:=0 to 2 do
            begin
              if (p2[i,k]>pal[i,k]) then dec(p2[i,k]);
              if (p2[i,k]>pal[i,k]) then dec(p2[i,k]);
            end;
          waitVBL;
          setAllpalette(p2);
        end;
      end;
  end;
end;
begin
 pp(pal);
{ setAllpalette(pal);}
end;

procedure tPalet.handleEvent(var event:tEvent);
begin
  if event.watch=cmEvent
  then begin
    case event.code of
      cmPal:begin
              case event.pow of
                0:begin
                    palette(0);
                  end;
                1:begin
                    palette(1);
                  end;
              end;
            end;
    end;
  end;
end;

begin
end.