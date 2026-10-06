'use strict';
// =============================================================================
//  WORK23.PAS — главная программа: дым, строка ввода, стек, меню, «рабочий
//  стол» (tDeskTop: ИИ, выделение, прокрутка, панель, сохранение/загрузка).
//     111=kom centr, 115=electr, 112=refin, 113=avia, 114=tank
// =============================================================================

var kolhelp = 50;
var quit = false;
var menu = null;
var stroka = null;

// ---------------------------------- tSmoke ----------------------------------
function TSmoke() {}
TSmoke.prototype = Object.create(TObject.prototype);
TSmoke.prototype.constructor = TSmoke;
TSmoke.prototype.SIZE = 112;
TSmoke.prototype.zero = function () { TObject.prototype.zero.call(this); this.timep = 0; };
TSmoke.prototype.save = function () { TObject.prototype.save.call(this); savefile.u8(this.timep); };
TSmoke.prototype.load2 = function () { TObject.prototype.load2.call(this); this.timep = loadfile.u8(); };
TSmoke.prototype.done = function () { TObject.prototype.done.call(this); };
TSmoke.prototype.init = function (xx, yy, tph, tp) {
  this.owner = null; this.elem = null; this.next = null; this.last = null;
  this.x = xx;
  this.y = yy;
  this.tip = b8(tp);
  this.angle = 0;
  this.timep = b8(tph);
  this.time3 = time10;
  this.timephase = 0;
  return this;
};
TSmoke.prototype.init2 = function () {
  this.owner = null; this.elem = null; this.next = null; this.last = null;
  this.time3 = time10;
  this.timephase = 0;
  return this;
};
TSmoke.prototype.handleevent = function (event) {
  var event2;
  if (event.watch === cmevent && event.code === cmfire) {
    modifpole2(idiv(this.x, 40), idiv(this.y, 40), 1);
    if (this.time3 > 0) this.time3--;
    else {
      this.x = this.x - 1;
      this.time3 = time10;
    }
    if (this.timephase > 0) this.timephase--;
    else {
      this.y = this.y - 1;
      this.timephase = this.timep;
      this.angle = b8(this.angle + 1);
      if (this.angle > 7) {
        event2 = new TEvent();
        event2.watch = cmevent;
        event2.otkogo = this;
        event2.code = cmdel;
        this.message(this.owner, event2);
        event2.watch = cmnothing;
      }
    }
  }
};
TSmoke.prototype.show = function () {
  var X = this.x - polex * 40, Y = this.y - poley * 40;
  if (X > -20 && X < 540 && Y > -20 && Y < 500 && this.angle < 6)
    putsprite(X, Y, massmoke[this.tip] ? massmoke[this.tip][this.angle] : null);
};

// ----------------------------------------------------------------------------
function newowner(p, newow) {
  p.owner = newow;
  p.select = 0;
}

// Поиск места для здания ИИ. Возвращает {x2, y2} (var-параметры).
// BUG (оригинал): если места нет, repeat..until крутится бесконечно (игра
// зависала); здесь цикл прерывается после 200000 попыток.
function puth(lx, ly, x1, y1, x2, y2, tb, ff) {
  var i, j, ii, jj, f, v;
  if (tb === 122) {
    x2 = -1; y2 = -1;
    for (i = maxx; i >= 0; i--)
      for (j = maxy; j >= 0; j--)
        if (gp(i, j, 0) === 10) {
          for (ii = i - 6; ii <= i + 6; ii++)
            for (jj = j - 6; jj <= j + 6; jj++) {
              v = gp(ii, jj, 0);
              if (v === 70 || v === 71 || inR(v, 121, 126) || v === 201 || ff) return { x2: i, y2: j };
            }
        }
    return { x2: x2, y2: y2 };
  }
  var guard = 0;
  do {
    f = false;
    ii = random(x2) - random(x2) + x1;
    jj = random(y2) - random(y2) + y1;
    for (i = ii - 2; i <= ii + lx + 2; i++)
      for (j = jj - 2; j <= jj + ly + 2; j++)
        if (i < 0 || j < 0 || i > maxx - lx - 1 || j > maxy - ly - 1 ||
            inSet(gp(i, j, 0), [121, 126, 201, 206, 10, 254, 255, 233]))
          f = true;
    if (++guard > 200000) { console.warn('[оригинал] PutH зациклился бы'); break; }
  } while (f);
  return { x2: ii, y2: jj };
}

// ---------------------------------- tStr ------------------------------------
function TStr() {}
TStr.prototype.SIZE = 93;
TStr.prototype.zero = function () {
  this.oldstr = ''; this.str = ''; this.pos = 0; this.sezi = 0; this.flagshow = false;
  this.color = 0; this.size = 0; this.time = 0; this.time2 = 0;
  this.mascolor = new Array(18).fill(0); this.sdvig = 0;
};
TStr.prototype.init = function () {
  this.oldstr = '';
  this.pos = 0;
  this.flagshow = true;
  this.size = 8;
  this.time2 = 100;
  this.time = this.time2;
  this.color = yellow;
  for (var i = 1; i <= 17; i++) this.mascolor[i] = 90 + i;
  this.sdvig = 0;
  return this;
};
TStr.prototype.done = function () {};
TStr.prototype.show = function () {
  hidemouse();
  setcolor(100);
  bar(menux + 26, menuy + 16 + 20 * numfile, menux + 25 + 32 * this.size, menuy + 12 + 20 * (numfile + 1));
  setcolor(91);
  outtextxy(menux + 26, menuy + 16 + 20 * numfile, filestr);
  this.flagshow = false;
  showmouse();
};
TStr.prototype.showcurs = function () {
  var i, k;
  hidemouse();
  for (i = 1; i <= 8; i++) {
    k = this.sdvig + i;
    if (k > 17) k = k - 17;
    setcolor(this.mascolor[k]);
    line(menux + 25 + i + (this.pos - 1) * this.size, menuy - 4 + 20 * (numfile + 1),
         menux + 25 + i + (this.pos - 1) * this.size, menuy + 12 + 20 * (numfile + 1));
    if (this.pos <= filestr.length) {
      setcolor(91);
      outtextxy(menux + 26 + (this.pos - 1) * this.size, menuy + 16 + 20 * numfile, filestr.charAt(this.pos - 1));
    }
  }
  showmouse();
};
// BUG (оригинал): расширенная клавиша приходит как #0 + скан-код; на #0 курсор
// уезжает в конец строки, поэтому стрелки/Del/Home/End работают «от конца».
// Заглавные K, M, S, G, O совпадают со скан-кодами и работают как они.
TStr.prototype.readstr = function (eventIn) {
  var event = eventIn.clone();               // параметр-значение
  var s, k;
  if (this.time > 0) this.time--;
  else {
    this.time = this.time2;
    if (this.sdvig > 0) this.sdvig--;
    else this.sdvig = 17;
    this.showcurs();
  }
  if (event.watch === cmkey) {
    k = event.key;
    if (k === 0) {
      this.oldstr = filestr;
      this.flagshow = true;
      if (this.pos > 32) this.pos = 32;
      if (filestr === R('          - пусто -')) fsAssign('');
      this.pos = filestr.length + 1;
    } else if (k === 27) {
      fsAssign(this.oldstr);
      event.watch = cmevent;
      event.code = cmno;
      menu.handleevent(event);
      return;
    } else if (k === 13) {
      if (filestr !== '') {
        event.watch = cmevent;
        event.code = cmyes;
        menu.handleevent(event);
        return;
      }
    } else if (k === 75) {
      if (this.pos > 1) {
        hidemouse();
        this.pos--;
        this.flagshow = true;
        showmouse();
        return;
      }
    } else if (k === 77) {
      if (this.pos < filestr.length + 1 && this.pos < 32) {
        hidemouse();
        this.pos++;
        this.flagshow = true;
        showmouse();
        return;
      }
    } else if (k === 83) {
      fsDelete(this.pos);
      this.flagshow = true;
    } else if (k === 8) {
      if (this.pos > 1) {
        fsDelete(this.pos - 1);
        this.pos--;
        this.flagshow = true;
      }
    } else if (k === 71) {
      this.pos = 1;
      this.flagshow = true;
    } else if (k === 79) {
      this.pos = filestr.length + 1;
      if (this.pos > 32) this.pos = 32;
      this.flagshow = true;
    } else if (inR(k, ch('a'), ch('z')) || inR(k, ch('а'), ch('я')) || inR(k, ch('1'), ch('9')) ||
               k === ch(' ') || k === ch('-') || k === ch('_')) {
      if (filestr.length < 32) {
        s = String.fromCharCode(k);
        fsInsert(s, this.pos);
        if (this.pos < 32) this.pos++;
        this.flagshow = true;
      }
    }
  }
  if (this.flagshow) this.show();
};

// ---------------------------------- tMenu -----------------------------------
function TMenu() {}
TMenu.prototype = Object.create(TObject.prototype);
TMenu.prototype.constructor = TMenu;
TMenu.prototype.SIZE = 5888;
TMenu.prototype.zero = function () {
  TObject.prototype.zero.call(this);
  this.sost = 0; this.num = 0;
  this.mess = new Array(14).fill('');
  this.messhelp = new Array(kolhelp + 1).fill('');
  this.masfile = new Array(101).fill('');
  this.kolfile = 0; this.num2 = 0; this.flagstr = false;
};
TMenu.prototype.save = function () { savefile.u8(this.sost); savefile.u8(this.num); };
TMenu.prototype.load2 = function () { this.sost = loadfile.u8(); this.num = loadfile.u8(); };
TMenu.prototype.done = function () { TObject.prototype.done.call(this); };

TMenu.prototype.readFileList = function () {
  var i, d, b, s;
  for (i = 1; i <= 12; i++) this.masfile[i] = '';
  this.kolfile = 1;
  for (;;) {
    d = fsRead('save' + this.kolfile + '.sav');
    if (d && d.length < 33) d = null;     // blockread 33 байт не удался -> IOResult<>0
    if (d) {
      b = d.subarray(0, 33); s = '';
      for (i = 0; i < b[0] && i < 32; i++) s += String.fromCharCode(b[i + 1]);
      this.masfile[this.kolfile] = s;
    }
    this.kolfile++;
    if (!d) break;
  }
  this.kolfile = this.kolfile - 2;
  if (this.kolfile < 12) this.masfile[this.kolfile + 1] = R('          - пусто -');
};

TMenu.prototype.init = function () {
  TObject.prototype.init.call(this);
  this.sost = 4;
  this.num = 0;
  this.num2 = 1;
  numfile = 1;
  this.flagstr = false;
  var m = this.mess;
  m[0] = ''; m[1] = ''; m[2] = '';
  m[3] = R('  По вопросам распространения');
  m[4] = R('    обращайтесь по телефону ');
  m[5] = R('   55-16-46 - ');
  m[6] = R('@              Архипов Павел.');
  m[7] = R('Чтобы научиться писать подобные ');
  m[8] = R(' программы, обращайтесь: ');
  m[9] = R('@                         город');
  m[10] = R('# Рыбинск, пр.Ленина 181 (ЦДЮТ),');
  m[11] = R('#      4 этаж, кабинет 88');
  m[12] = R('     E-Mail:');
  m[13] = R('@             cdut@mail.ru');
  var h = [
    '#         Цели и средства:',
    '1. Постройте электростанцию, чтобы',
    '   можно было создать завод для',
    '   добычи ресурсов',
    '2. Этот завод ставится только в',
    '   специальной области',
    '3. Стройте машинные заводы',
    '4. Для обороны используйте пушки',
    '5. Восстанавливайте поврежденную',
    '   технику на специальной площадке',
    '6. Для массированной атаки танки',
    '   можно выделить в группу',
    '7. Невидимки обладают свойством ',
    '   невидимости только в том случае,',
    '   если они не находятся в радиусе',
    '   действия вражеской зенитки или',
    '   детектора',
    '8. "Chrono"танки могут моментально',
    '   перемещаться в любое место',
    '   игрового поля',
    '9. Стройте воздушные транспорты',
    '   для быстрой доставки танков',
    '   к месту боевых действий',
    '10.Управление стандартное',
    '11.С помощью клавиши Shift можно',
    '   добавить один танк в группу',
    '   выбранных, не отказываясь при',
    '   этом от остальных объектов, или',
    '   отказаться от выбора только',
    '   одного объекта',
    '12.Чтобы выбрать все видимые на',
    '   экране объекты нажмите "E"',
    '13."R"-отказаться от всей группы',
    '14."C"-скрывание (для невидимок)',
    '15.Можно сохранить до 10 выбранных',
    '   групп, нажав Shift и "0"-"9"',
    '16.Вражеские структуры на радаре',
    '   изображаются красным цветом,',
    '   свои-зеленым, ресурсы-голубым',
    '17.Чтобы попасть в нужное место',
    '   игрового поля нажмите левую',
    '   кнопку мыши на экране радара',
    '18.Скроллинг,передвижение и ремонт',
    '   сопровождаются различными',
    '   курсорами мыши',
    '19.Опасайтесь скрытых самолетов',
    '   противника!',
    '20.Ни в коем случае не разрешайте ',
    '   компьютеру захватывать ресурсы!',
    '   ',
    '#           Желаю удачи!'
  ];
  for (var i = 0; i <= kolhelp; i++) this.messhelp[i] = R(h[i]);
  this.readFileList();
  return this;
};

TMenu.prototype.drawFileList = function (j) {
  for (var i = this.num2; i <= j; i++) {
    if (numfile === i) putsprite(menux + 15 - 2, menuy + 18 + 20 * (i - this.num2 + 1) + 1, pict[17]);
    else putsprite(menux + 15 - 2, menuy + 18 + 20 * (i - this.num2 + 1) + 1, pict[16]);
    if (numfile === i) setcolor(91); else setcolor(95);
    outtextxy(menux + 25 + 1, menuy + 15 + 20 * (i - this.num2 + 1) + 1, this.masfile[i]);
  }
};

TMenu.prototype.show = function () {
  var k, i, j, s;
  var cx = menux + idiv(menux2 - menux, 2) - 16;
  hidemouse();
  if (this.sost !== 7 && this.sost !== 9) showwindow(menux, menuy, menux2, menuy2);
  switch (this.sost) {
    case 0:
      drawbutton(menux + 20, menuy + 20, menux2 - 20, menuy + 40, R('Помощь'), false, false);
      drawbutton(menux + 20, menuy + 20 + 25 * 1, menux2 - 20, menuy + 40 + 25 * 1, R('Информация'), false, false);
      drawbutton(menux + 20, menuy + 20 + 25 * 2, menux2 - 20, menuy + 40 + 25 * 2, R('Загрузить'), false, false);
      drawbutton(menux + 20, menuy + 20 + 25 * 3, menux2 - 20, menuy + 40 + 25 * 3, R('Сохранить'), false, false);
      drawbutton(menux + 20, menuy + 20 + 25 * 4, menux2 - 20, menuy + 40 + 25 * 4, R('Перезапуск'), false, false);
      drawbutton(menux + 20, menuy + 20 + 25 * 5, menux2 - 20, menuy + 40 + 25 * 5, R('Продолжить'), false, false);
      drawbutton(menux + 20, menuy + 20 + 25 * 6, menux2 - 20, menuy + 40 + 25 * 6, R('Выход'), false, false);
      drawbutton(menux + 20, menuy2 - 55, menux2 - 20, menuy2 - 35, R('ЦДЮТ'), true, false);
      drawbutton(menux + 20, menuy2 - 35, menux2 - 20, menuy2 - 15, R('2000 год'), true, false);
      putsprite(cx, menuy + 240, pict[5]);
      break;
    case 1:
      setcolor(122);
      borlandouttextxy(menux + 50, menuy + 35, R('Операция "Ы"'), gothp);
      setcolor(125);
      outtextxy(menux + 72 + 10, menuy + 47, R('Рыбинск, 2000 год'));
      i = 0; j = 0;
      while (i <= 13) {
        s = this.mess[i];
        if (s.charAt(0) === '@') {
          k = 91;
          s = s.slice(1);
        } else {
          if (s.charAt(0) === '#') {
            k = 91;
            s = s.slice(1);
            j++;
          } else {
            k = 95;
            j++;
          }
        }
        setcolor(110);
        outtextxy(menux + 17 + 8, menuy + 15 + 20 * (j - 1), s);
        setcolor(k);
        outtextxy(menux + 17 + 1 + 8, menuy + 15 + 20 * (j - 1) + 1, s);
        i++;
      }
      line(menux + 130, menuy + 31 + 20 * (j - 1), menux + 225, menuy + 31 + 20 * (j - 1));
      putsprite(cx, menuy + 245, pict[5]);
      drawbutton(menux + 20, menuy2 - 45, menux2 - 20, menuy2 - 25, R('Продолжить'), false, false);
      break;
    case 2:
      if (this.num + 12 <= kolhelp) j = this.num + 12;
      else j = kolhelp;
      for (i = this.num; i <= j; i++) {
        k = 95;
        s = this.messhelp[i];
        if (s.charAt(0) === '#') {
          k = 92;
          s = s.slice(1);
        }
        setcolor(110);
        outtextxy(menux + 15, menuy + 15 + 18 * (i - this.num), s);
        setcolor(k);
        outtextxy(menux + 15 + 1, menuy + 15 + 18 * (i - this.num) + 1, s);
      }
      putsprite(cx, menuy + 260, pict[5]);
      drawbutton(menux + 20, menuy2 - 45, menux2 - 20, menuy2 - 25, R('Продолжить'), false, false);
      if (this.num >= 12) drawbutton(menux + 20, menuy2 - 75, menux + 105, menuy2 - 55, R('Назад'), false, false);
      if (this.num + 12 < kolhelp) drawbutton(menux2 - 105, menuy2 - 75, menux2 - 20, menuy2 - 55, R('Вперед'), false, false);
      break;
    case 4:
      borlandsettextsize(1);
      setcolor(125);
      borlandouttextxy(menux + 20 + 10, menuy + 40, R('Центр Детского'), gothp);
      borlandouttextxy(menux + 130 + 10, menuy + 70, R('и'), gothp);
      borlandouttextxy(menux + 55 + 10, menuy + 100, R('Юношеского'), gothp);
      borlandouttextxy(menux + 65 + 10, menuy + 130, R('Творчества'), gothp);
      setcolor(119);
      borlandouttextxy(menux + 40 + 10, menuy + 180, R('Операция "Ы"'), gothp);
      setcolor(127);
      outtextxy(menux + 72 + 10, menuy + 220 + 10, R('Рыбинск, 2000 год'));
      putsprite(cx, menuy + 250, pict[5]);
      drawbutton(menux + 20, menuy2 - 45, menux2 - 20, menuy2 - 25, R('Продолжить'), false, false);
      break;
    case 6:
      setcolor(119);
      outtextxy(menux + 50, menuy + 15, R('Выберите файл для загрузки'));
      this.drawFileList(this.kolfile);
      drawbutton(menux + 20, menuy2 - 60, menux2 - 20, menuy2 - 40, R('Загрузить'), false, false);
      drawbutton(menux + 20, menuy2 - 36, menux2 - 20, menuy2 - 16, R('Отмена'), false, false);
      break;
    case 7:
      this.drawFileList(this.kolfile);
      this.sost = 6;
      break;
    case 8:
      setcolor(119);
      outtextxy(menux + 40, menuy + 15, R('Выберите файл для сохранения'));
      this.drawFileList(this.kolfile + 1 < 12 ? this.kolfile + 1 : 12);
      drawbutton(menux + 20, menuy2 - 60, menux2 - 20, menuy2 - 40, R('Сохранить'), false, false);
      drawbutton(menux + 20, menuy2 - 36, menux2 - 20, menuy2 - 16, R('Отмена'), false, false);
      break;
    case 9:
      this.drawFileList(this.kolfile + 1 < 12 ? this.kolfile + 1 : 12);
      this.sost = 8;
      break;
  }
  showmouse();
};

function inBox(e, x1, y1, x2, y2) { return e.xm > x1 && e.xm < x2 && e.ym > y1 && e.ym < y2; }

TMenu.prototype.handleevent = function (event) {
  var i, j, s1;
  if (this.flagstr) {
    if (event.watch === cmevent) {
      switch (event.code) {
        case cmno:
          this.flagstr = false;
          this.sost = 8;
          newmenu[0] = true;
          break;
        case cmyes:
          this.sost = 0;
          newmenu[0] = true;
          this.flagstr = false;
          filename = 'save' + numfile + '.sav';
          desk.save();
          break;
      }
    }
    stroka.readstr(event);
    return;
  }

  if (event.watch === cmevent) {
    if (event.code === cmrestore) {
      this.num2 = 1;
      numfile = 1;
      this.readFileList();
    }
  }
  if (event.watch === cmkey) {
    switch (event.key) {
      case 72:
        if (this.sost === 6 || this.sost === 8) {
          if (numfile > 1) {
            numfile--;
            newmenu[0] = true;
            if (this.sost === 8) this.sost = 9;
            if (this.sost === 6) this.sost = 7;
          }
        }
        break;
      case 80:
        if (this.sost === 6 || this.sost === 8) {
          if ((numfile < this.kolfile && this.sost === 6) ||
              (this.sost === 8 && numfile < this.kolfile + 1 && numfile < 12)) {
            numfile++;
            newmenu[0] = true;
            if (this.sost === 8) this.sost = 9;
            if (this.sost === 6) this.sost = 7;
          }
        }
        break;
      case 13:
        if (this.sost === 4) {
          play('wav2.wav');
          flagmenu = false;
          this.sost = 0;
          pereris[0] = true;
          pereris[1] = true;
          cursor = oldcursor;
          setcursor(cursor);
        }
        if (this.sost === 6) {
          hidemouse();
          drawbutton(menux + 20, menuy2 - 60, menux2 - 20, menuy2 - 40, R('Загрузить'), true, false);
          showmouse();
          play('wav2.wav');
          delay(100);
          filename = 'save' + numfile + '.sav';
          desk.load2();
        }
        if (this.sost === 8 && numfile <= 12) {
          fsAssign(this.masfile[numfile]);
          event.watch = cmkey;
          event.key = 0;
          stroka.readstr(event);
          this.flagstr = true;
          hidemouse();
          drawbutton(menux + 20, menuy2 - 60, menux2 - 20, menuy2 - 40, R('Сохранить'), true, false);
          showmouse();
          play('wav2.wav');
        }
        break;
      case 27:
        play('wav2.wav');
        if (this.sost !== 0) {
          if (this.sost !== 4) newmenu[0] = true;
          else {
            flagmenu = false;
            pereris[0] = true;
            pereris[1] = true;
            cursor = oldcursor;
            setcursor(cursor);
          }
          this.sost = 0;
        } else {
          flagmenu = false;
          pereris[0] = true;
          pereris[1] = true;
          cursor = oldcursor;
          setcursor(cursor);
          if (desk.arrow !== 0) hidemouse();
        }
        break;
      case ch('q'): case ch('Q'): case ch('й'): case ch('Й'):
        if (event.key !== 81) {              // #81 = 'Q' (и PgDn) — исключено
          flagquit = true;
          quit = true;
        }
        break;
    }
  }
  if (event.watch === cmmouse && event.button === 1) {
    switch (this.sost) {
      case 0:
        if (inBox(event, menux + 20, menuy + 20 + 25 * 2, menux2 - 20, menuy + 40 + 25 * 2)) {
          hidemouse();
          drawbutton(menux + 20, menuy + 20 + 25 * 2, menux2 - 20, menuy + 40 + 25 * 2, R('Загрузить'), true, false);
          showmouse();
          play('wav1.wav');
          delay(100);
          hidemouse();
          drawbutton(menux + 20, menuy + 20 + 25 * 2, menux2 - 20, menuy + 40 + 25 * 2, R('Загрузить'), false, false);
          showmouse();
          flagmenu = true;
          newmenu[0] = true;
          this.sost = 6;
          newmenu[0] = true;
        }
        if (inBox(event, menux + 20, menuy + 20 + 25 * 3, menux2 - 20, menuy + 40 + 25 * 3)) {
          hidemouse();
          drawbutton(menux + 20, menuy + 20 + 25 * 3, menux2 - 20, menuy + 40 + 25 * 3, R('Сохранить'), true, false);
          showmouse();
          play('wav1.wav');
          delay(100);
          hidemouse();
          drawbutton(menux + 20, menuy + 20 + 25 * 3, menux2 - 20, menuy + 40 + 25 * 3, R('Сохранить'), false, false);
          showmouse();
          this.sost = 8;
          newmenu[0] = true;
        }
        if (inBox(event, menux + 20, menuy + 20 + 25 * 6, menux2 - 20, menuy + 40 + 25 * 6)) {
          this.sost = 3;
          hidemouse();
          drawbutton(menux + 20, menuy + 20 + 25 * 6, menux2 - 20, menuy + 40 + 25 * 6, R('Выход'), true, false);
          showmouse();
          play('wav3.wav');
          delay(100);
          hidemouse();
          showwindow(menux + 20, menuy + 190, menux2 - 20, menuy + 280);
          setcolor(110);
          outtextxy(menux + 20 + 80, menuy + 163 + 40, R('Вы уверены?'));
          setcolor(95);
          outtextxy(menux + 20 + 1 + 80, menuy + 163 + 40 + 1, R('Вы уверены?'));
          drawbutton(menux + 20 + 60, menuy + 263 - 20, menux + 20 + 110, menuy + 263 - 0, R('Да'), false, false);
          drawbutton(menux + 20 + 140, menuy + 263 - 20, menux + 20 + 190, menuy + 263 - 0, R('Нет'), false, false);
          showmouse();
        }
        if (inBox(event, menux + 20, menuy + 20 + 25 * 4, menux2 - 20, menuy + 40 + 25 * 4)) {
          this.sost = 5;
          hidemouse();
          drawbutton(menux + 20, menuy + 20 + 25 * 4, menux2 - 20, menuy + 40 + 25 * 4, R('Перезапуск'), true, false);
          showmouse();
          play('wav1.wav');
          delay(100);
          showwindow(menux + 20, menuy + 190, menux2 - 20, menuy + 280);
          setcolor(110);
          outtextxy(menux + 20 + 80, menuy + 163 + 40, R('Начать сначала?'));
          setcolor(95);
          hidemouse();
          outtextxy(menux + 20 + 65, menuy + 163 + 40, R('Начать сначала?'));
          drawbutton(menux + 20 + 60, menuy + 263 - 20, menux + 20 + 110, menuy + 263 - 0, R('Да'), false, false);
          drawbutton(menux + 20 + 140, menuy + 263 - 20, menux + 20 + 190, menuy + 263 - 0, R('Нет'), false, false);
          showmouse();
        }
        if (inBox(event, menux + 20, menuy + 20 + 25 * 5, menux2 - 20, menuy + 40 + 25 * 5)) {
          flagmenu = false;
          pereris[0] = true;
          pereris[1] = true;
          hidemouse();
          drawbutton(menux + 20, menuy + 20 + 25 * 5, menux2 - 20, menuy + 40 + 25 * 5, R('Продолжить'), true, false);
          showmouse();
          play('wav1.wav');
          delay(100);
          cursor = oldcursor;
          setcursor(cursor);
        }
        if (inBox(event, menux + 20, menuy + 20 + 25 * 1, menux2 - 20, menuy + 40 + 25 * 1)) {
          this.sost = 1;
          newmenu[0] = true;
          hidemouse();
          drawbutton(menux + 20, menuy + 20 + 25 * 1, menux2 - 20, menuy + 40 + 25 * 1, R('Информация'), true, false);
          showmouse();
          play('wav1.wav');
          delay(100);
        }
        if (inBox(event, menux + 20, menuy + 20, menux2 - 20, menuy + 40)) {
          this.sost = 2;
          newmenu[0] = true;
          hidemouse();
          drawbutton(menux + 20, menuy + 20, menux2 - 20, menuy + 40, R('Помощь'), true, false);
          showmouse();
          play('wav1.wav');
          delay(100);
        }
        break;
      case 1:
        if (inBox(event, menux + 20, menuy2 - 45, menux2 - 20, menuy2 - 25)) {
          this.sost = 0;
          newmenu[0] = true;
          hidemouse();
          drawbutton(menux + 20, menuy2 - 45, menux2 - 20, menuy2 - 25, R('Продолжить'), true, false);
          showmouse();
          play('wav2.wav');
          delay(100);
        }
        break;
      case 2:
        if (this.num >= 13 && inBox(event, menux + 20, menuy2 - 75, menux + 105, menuy2 - 55)) {
          this.num = this.num - 13;
          newmenu[0] = true;
          hidemouse();
          drawbutton(menux + 20, menuy2 - 75, menux + 105, menuy2 - 55, R('Назад'), true, false);
          showmouse();
          play('wav2.wav');
          delay(150);
        }
        if (this.num + 13 < kolhelp && inBox(event, menux2 - 105, menuy2 - 75, menux2 - 20, menuy2 - 55)) {
          this.num = this.num + 13;
          newmenu[0] = true;
          hidemouse();
          drawbutton(menux2 - 105, menuy2 - 75, menux2 - 20, menuy2 - 55, R('Вперед'), true, false);
          showmouse();
          play('wav2.wav');
          delay(150);
        }
        if (inBox(event, menux + 20, menuy2 - 45, menux2 - 20, menuy2 - 25)) {
          this.sost = 0;
          newmenu[0] = true;
          hidemouse();
          drawbutton(menux + 20, menuy2 - 45, menux2 - 20, menuy2 - 25, R('Продолжить'), true, false);
          showmouse();
          play('wav2.wav');
          delay(100);
        }
        break;
      case 3:
        if (inBox(event, menux + 20 + 60, menuy + 263 - 20, menux + 20 + 110, menuy + 263 - 0)) {
          flagquit = true;
          quit = true;
          hidemouse();
          drawbutton(menux + 20 + 60, menuy + 263 - 20, menux + 20 + 110, menuy + 263 - 0, R('Да'), true, false);
          showmouse();
          play('wav2.wav');
          waitSoundEnd();                    // repeat until EndingPlay
        }
        if (inBox(event, menux + 20 + 140, menuy + 263 - 20, menux + 20 + 190, menuy + 263 - 0)) {
          this.sost = 0;
          newmenu[0] = true;
          hidemouse();
          drawbutton(menux + 20 + 140, menuy + 263 - 20, menux + 20 + 190, menuy + 263 - 0, R('Нет'), true, false);
          showmouse();
          play('wav2.wav');
          delay(100);
        }
        break;
      case 4:
        if (inBox(event, menux + 20, menuy2 - 45, menux2 - 20, menuy2 - 25)) {
          this.sost = 0;
          flagmenu = false;
          pereris[0] = true;
          pereris[1] = true;
          hidemouse();
          drawbutton(menux + 20, menuy2 - 45, menux2 - 20, menuy2 - 25, R('Продолжить'), true, false);
          showmouse();
          play('wav2.wav');
          delay(100);
          cursor = oldcursor;
          setcursor(cursor);
        }
        break;
      case 5:
        if (inBox(event, menux + 20 + 60, menuy + 263 - 20, menux + 20 + 110, menuy + 263 - 0)) {
          flagquit = true;
          quit = false;
          hidemouse();
          drawbutton(menux + 20 + 60, menuy + 263 - 20, menux + 20 + 110, menuy + 263 - 0, R('Да'), true, false);
          showmouse();
          play('wav2.wav');
          delay(100);
        }
        if (inBox(event, menux + 20 + 140, menuy + 263 - 20, menux + 20 + 190, menuy + 263 - 0)) {
          this.sost = 0;
          newmenu[0] = true;
          hidemouse();
          drawbutton(menux + 20 + 140, menuy + 263 - 20, menux + 20 + 190, menuy + 263 - 0, R('Нет'), true, false);
          showmouse();
          play('wav2.wav');
          delay(100);
        }
        break;
      case 6: case 8:
        if (inBox(event, menux + 20, menuy2 - 36, menux2 - 20, menuy2 - 16)) {
          hidemouse();
          drawbutton(menux + 20, menuy2 - 36, menux2 - 20, menuy2 - 16, R('Отмена'), true, false);
          showmouse();
          play('wav2.wav');
          delay(100);
          this.sost = 0;
          newmenu[0] = true;
          return;
        }
        if (inBox(event, menux + 20, menuy2 - 60, menux2 - 20, menuy2 - 40)) {
          hidemouse();
          if (this.sost === 6) drawbutton(menux + 20, menuy2 - 60, menux2 - 20, menuy2 - 40, R('Загрузить'), true, false);
          if (this.sost === 8) drawbutton(menux + 20, menuy2 - 60, menux2 - 20, menuy2 - 40, R('Сохранить'), true, false);
          showmouse();
          play('wav2.wav');
          delay(100);
          if (this.sost === 6) {
            if (this.kolfile > 0) {
              filename = 'save' + numfile + '.sav';
              desk.load2();
              return;
            } else {
              this.sost = 0;
              newmenu[0] = true;
              return;
            }
          }
          if (this.sost === 8) {
            fsAssign(this.masfile[numfile]);
            event.watch = cmkey;
            event.key = 0;
            stroka.readstr(event);
            this.flagstr = true;
            return;
          }
        }
        if (this.sost === 6) j = this.kolfile;
        if (this.sost === 8) {
          if (this.kolfile + 1 < 13) j = this.kolfile + 1;
          else j = this.kolfile;
        }
        if (this.sost === 6 || this.sost === 8) {
          for (i = 1; i <= j; i++) {
            if (event.xm > menux + 5 && event.xm < menux2 - 5 &&
                event.ym > menuy + 15 + 20 * (i - this.num2 + 1) + 1 &&
                event.ym < menuy + 15 + 20 * (i - this.num2 + 2) + 1) {
              numfile = i;
              newmenu[0] = true;
              if (this.sost === 6) this.sost = 7;
              if (this.sost === 8) this.sost = 9;
              return;
            }
          }
        }
        break;
    }
  }
};

// ---------------------------------- tStack ----------------------------------
function TStack() {}
TStack.prototype.SIZE = 12;
TStack.prototype.zero = function () { this.st = new Array(11).fill(0); this.top = 0; };
TStack.prototype.save = function () { for (var i = 1; i <= 10; i++) savefile.u8(this.st[i]); savefile.i16(this.top); };
TStack.prototype.load2 = function () { for (var i = 1; i <= 10; i++) this.st[i] = loadfile.u8(); this.top = loadfile.i16(); };
TStack.prototype.init = function () { this.top = 0; return this; };
TStack.prototype.done = function () {};
TStack.prototype.pop = function () {
  if (this.top > 0) {
    var r = this.st[this.top];
    this.top--;
    return r;
  }
  sound(1000);
  delay(1000);
  nosound();
  return 0;                                   // в оригинале результат не определён
};
TStack.prototype.push = function (x) {
  this.top++;
  if (this.top > 10) { rangeError('tStack.st'); return; }
  this.st[this.top] = x;
};

// ---------------------------------- tDeskTop --------------------------------
function TDeskTop() {}
TDeskTop.prototype = Object.create(TGroup.prototype);
TDeskTop.prototype.constructor = TDeskTop;
TDeskTop.prototype.SIZE = 188;
TDeskTop.prototype.zero = function () {
  TObject.prototype.zero.call(this);
  this.scrolltime = 0; this.rasbuild = 0; this.tipbuild = 0; this.otkogo = null;
  this.oldmousex = [0, 0]; this.oldmousey = [0, 0];
  this.mousex1 = 0; this.mousey1 = 0; this.mousex2 = 0; this.mousey2 = 0;
  this.flagbuildhouse = false; this.flagramka = false; this.flagpressmouse = false;
  this.stb = null; this.stt = null; this.sta = null;
  this.flagbuildtank = false; this.flagbuildair = false;
  this.timebuildh = 0; this.tbuildh = 0; this.timebuildt = 0; this.tbuildt = 0;
  this.timebuilda = 0; this.tbuilda = 0;
  this.builder = null; this.xm2 = 0; this.ym2 = 0; this.arrow = 0; this.vibor = false;
  this.tarx = 0; this.tary = 0; this.flagshowmove = false; this.timeshowmove = 0;
  this.showmove = [0, 0, 0, 0];
  this.runEvent = new TEvent();
};

TDeskTop.prototype.show2 = function () {
  newpanel[0] = true;
  newpanel[1] = true;
  page = 0;
  setwsize(0, 0, 640, 480);
  hidemouse();
  setvisualpage(page);
  setactivepage(1 - page);
  this.drawStatic();
  page = 1 - page;
  setvisualpage(page);
  setactivepage(1 - page);
  this.drawStatic();
  setwsize(0, 0, 520, 480);
  showmouse();
  showmouse();
  setactivepage(1);
};
TDeskTop.prototype.drawStatic = function () {
  this.showall(1);
  drawwindow(520, 0, 640, radary + maxy + 15);
  drawwindow(520, radary + maxy + 16, 640, 480);
  setcolor(diedcolor);
  bar(radarx, radary, radarx + maxx, radary + maxy);
  radar();
  radar2();
  rectangle(radarx - 1, radary - 1, radarx + maxx + 1, radary + maxy + 1, 0, 0);
};

// --------------------------- искусственный интеллект ------------------------
TDeskTop.prototype.intellect = function () {
  var self = this, i, xx, yy, event2 = new TEvent();

  function createbuild() {
    var target, r;
    switch (sostb) {
      case 0:
        i = 120;
        while (!(numberbuild[i] < maxbuild[i] && masflagbuild[i])) {
          i++;
          if (i > 126) { sostb = 3; return; }
        }
        if (i !== 120) {
          if (money[1] >= mascoast[i]) {
            money[1] = money[1] - mascoast[i];
            self.stb.push(2);
            self.tbuildh = i;
            self.timebuildh = mastimebuild[self.tbuildh];
            sostb = 1;
          }
        } else sostb = 3;
        if (!construction) sostb = 5;
        break;
      case 1:
        if (self.timebuildh > 0) self.timebuildh--;
        else sostb = self.stb.pop();
        break;
      case 2:
        xx = 25; yy = 25;
        r = puth(massize[self.tbuildh][0], massize[self.tbuildh][1], 80, 80, xx, yy, self.tbuildh, false);
        xx = r.x2; yy = r.y2;
        if (xx > 0 && yy > 0)
          enemyhouse.insert(New(THouse).init(xx, yy, massize[self.tbuildh][0], massize[self.tbuildh][1],
            self.tbuildh, 1, maspow[self.tbuildh], maspow[self.tbuildh]));
        numberbuild[self.tbuildh] = b8((numberbuild[self.tbuildh] || 0) + 1);
        sostb = 0;
        switch (self.tbuildh) {
          case 125: masflagbuild[122] = true; break;
          case 122: masflagbuild[124] = true; break;
          case 124: masflagbuild[123] = true; self.flagbuildtank = true; break;
          case 123: self.flagbuildair = true; break;
        }
        break;
      case 3:
        if (!construction) { sostb = 5; return; }
        event2.watch = cmevent;
        event2.code = cmturret;
        event2.otkogo = null;
        self.message(enemyhouse, event2);
        if (event2.otkogo !== null) {
          if (money[1] >= mascoast[event2.tip]) {
            money[1] = money[1] - mascoast[event2.tip];
            self.stb.push(4);
            self.tbuildh = event2.tip;
            self.timebuildh = mastimebuild[self.tbuildh];
            self.builder = event2.otkogo;
            sostb = 1;
          }
        } else sostb = 5;
        break;
      case 4:
        event2.watch = cmevent;
        event2.code = cmputturret;
        event2.tip = self.tbuildh;
        self.message(self.builder, event2);
        self.builder = null;
        sostb = 3;
        break;
      case 5:
        if (memavail() < 20000) { sostb = 8; return; }
        if (complet && !zahvat && !attack && koltank === 0 && kolair === 0 && flag67 &&
            !patrol[0] && !patrol[1]) {
          koltank = koltank + inckol[0];
          kolair = kolair + inckol[1];
          if (random(100) > prioritet || notiberium) sostb = 8;
          else {
            zahvat = true;
            complet = false;
          }
        }
        if (zahvat && !notiberium) {
          sostb = 6;
          flagtiberium = 0;
        }
        if (!notiberium && flagtiberium === 5 && zahvat) {
          sostb = 0;
          flagtiberium = 1;
        }
        if (zahvat && notiberium) {
          zahvat = false;
          complet = true;
        }
        break;
      case 6:
        xx = 0; yy = 0;
        r = puth(massize[self.tbuildh][0], massize[self.tbuildh][1], 80, 80, xx, yy, 122, true);
        xx = r.x2; yy = r.y2;
        if (xx < 0 && yy < 0) notiberium = true;
        if (xx !== 0 && yy !== 0 && !notiberium) {
          event2.watch = cmevent;
          event2.code = cmnewgo2;
          event2.newx = xx;
          event2.newy = yy;
          self.message(enemytank, event2);
          self.message(enemyair, event2);
          flagtiberium = 1;
          zahvat = false;
          sostb = 5;
        } else {
          sostb = 5;
        }
        break;
      case 7:
        xx = 0; yy = 0;
        r = puth(massize[self.tbuildh][0], massize[self.tbuildh][1], 80, 80, xx, yy, 122, false);
        xx = r.x2; yy = r.y2;
        if (xx > 0 && yy > 0) {
          maxbuild[122] = b8(maxbuild[122] + 1);
          sostb = 0;
        }
        break;
      case 8:
        if (random(2) > 0) {
          r = self.seektarget2(0);
          target = r.p; xx = r.xx; yy = r.yy;
          if (target !== null) {
            self.tarx = xx; self.tary = yy;
            event2.watch = cmevent;
            event2.code = cmattack4;
            event2.x = xx;
            event2.y = yy;
            event2.ground = 0;
            self.message(enemytank, event2);
            self.message(enemyair, event2);
          }
          sostb = 5;
        }
        break;
    }
  }

  function createtank() {
    var i, j;
    switch (sostt) {
      case 0:
        if (kolpatrol[0] > 0 && patrol[0]) {
          self.tbuildt = 60 + random(4);
          if (money[1] >= mascoast[self.tbuildt]) {
            money[1] = money[1] - mascoast[self.tbuildt];
            self.timebuildt = mastimebuild[self.tbuildt];
            self.stt.push(2);
            sostt = 1;
          }
        } else {
          if (koltank > 0) {
            self.tbuildt = 60 + random(4);
            if (money[1] >= mascoast[self.tbuildt]) {
              money[1] = money[1] - mascoast[self.tbuildt];
              self.timebuildt = mastimebuild[self.tbuildt];
              self.stt.push(2);
              sostt = 1;
            }
          } else if (!flag67) {
            self.tbuildt = 67;
            if (money[1] >= mascoast[self.tbuildt]) {
              money[1] = money[1] - mascoast[self.tbuildt];
              self.timebuildt = 10;
              self.stt.push(2);
              sostt = 1;
            }
          }
        }
        break;
      case 1:
        if (self.timebuildt > 0) self.timebuildt--;
        else sostt = self.stt.pop();
        break;
      case 2:
        event2.watch = cmevent;
        event2.code = cmwho3;
        event2.pow = 0;
        event2.tip = 124;
        self.message(enemyhouse, event2);
        if (event2.pow === cmitiswho && memavail() > 20000) {
          var ex = event2.x, ey = event2.y, esx = event2.sx, esy = event2.sy, t = self.tbuildt;
          for (i = ex - 1; i <= ex + esx; i++)
            for (j = ey - 1; j <= ey + esy; j++)
              if (i >= 0 && j >= 0 && i <= maxx && j <= maxy && inSet(gp(i, j, 0), [0, 3, 4])) {
                if (patrol[0]) {
                  enemytank.insert(New(TTank).init(i, j, i, j, i, j, 0, 0,
                    maspow[t], maspow[t], 1, 0, t, 1, 32, 32, 2, 0, false, 0, 0,
                    masdis[t], masdam[t], mastime[t], null, 0, true));
                  kolpatrol[0]--;
                  if (kolpatrol[0] === 0) patrol[0] = false;
                  sostt = 0;
                  return;
                } else {
                  if (t !== 67) {
                    koltank--;
                    event2.otkogo = null;
                    event2.x = i;
                    event2.y = j;
                    event2.watch = cmevent;
                    event2.code = cmnewdefen;
                    event2.pow = 0;
                    self.message(enemyhouse, event2);
                    if (event2.otkogo !== null) {
                      enemytank.insert(New(TTank).init(i, j, event2.x, event2.y, i, j, 0, 0,
                        maspow[t], maspow[t], 1, 0, t, 1, 32, 32, 2, 0, false, 0, 0,
                        masdis[t], masdam[t], mastime[t], event2.otkogo, 255, false));
                    } else {
                      enemytank.insert(New(TTank).init(i, j, event2.x, event2.y, i, j, 0, 0,
                        maspow[t], maspow[t], 1, 0, t, 1, 32, 32, 2, 0, false, 0, 0,
                        masdis[t], masdam[t], mastime[t], null, 0, false));
                    }
                  } else {
                    enemytank.insert(New(TTank).init(i, j, i, j, i, j, 0, 0,
                      maspow[t], maspow[t], 1, 0, t, 1, 32, 32, 3, 0, false, 0, 0,
                      masdis[t], masdam[t], mastime[t], null, 255, false));
                    flag67 = true;
                  }
                }
                sostt = 0;
                return;
              }
        }
        break;
    }
  }

  function createair() {
    var i, j;
    switch (sosta) {
      case 0:
        if (kolair > 0 || kolpatrol[1] > 0) {
          i = random(100);
          if (money[1] >= mascoast[i]) {
            if (inR(i, 0, 10)) self.tbuilda = 77;
            else if (inR(i, 11, 20)) self.tbuilda = 80;
            else if (inR(i, 21, 45)) self.tbuilda = 76;
            else if (inR(i, 46, 75)) self.tbuilda = 78;
            else if (inR(i, 76, 100)) self.tbuilda = 79;
            if (money[1] >= mascoast[self.tbuilda]) {
              money[1] = money[1] - mascoast[i];
              self.timebuilda = mastimebuild[self.tbuilda];
              self.sta.push(2);
              sosta = 1;
            }
          }
        }
        break;
      case 1:
        if (self.timebuilda > 0) self.timebuilda--;
        else sosta = self.sta.pop();
        break;
      case 2:
        event2.watch = cmevent;
        event2.code = cmwho3;
        event2.pow = 0;
        event2.tip = 123;
        self.message(enemyhouse, event2);
        if (event2.pow === cmitiswho && memavail() > 20000) {
          var ex = event2.x, ey = event2.y, esx = event2.sx, esy = event2.sy, t = self.tbuilda;
          for (i = ex - 1; i <= ex + esx; i++)
            for (j = ey - 1; j <= ey + esy; j++)
              if (i >= 0 && j >= 0 && i <= maxx && j <= maxy && gp(i, j, 1) === 0) {
                if (patrol[1]) {
                  enemyair.insert(New(TAir).init(i, j, i, j, i, j, 0, 0,
                    maspow[t], maspow[t], 1, 0, t, 1, 32, 32, 2, 0, false, 0, 0,
                    masdis[t], masdam[t], mastime[t], null, 0, true));
                  kolpatrol[1]--;
                  if (kolpatrol[1] === 0) patrol[1] = false;
                  sosta = 0;
                  return;
                } else {
                  kolair--;
                  event2.otkogo = null;
                  event2.x = i;
                  event2.y = j;
                  event2.watch = cmevent;
                  event2.code = cmnewdefen;
                  event2.pow = 1;
                  self.message(enemyhouse, event2);
                  if (event2.otkogo !== null) {
                    enemyair.insert(New(TAir).init(i, j, event2.x, event2.y, i, j, 0, 0,
                      maspow[t], maspow[t], 1, 0, t, 1, 32, 32, 2, 0, false, 0, 0,
                      masdis[t], masdam[t], mastime[t], event2.otkogo, 255, false));
                  } else {
                    enemyair.insert(New(TAir).init(i, j, event2.x, event2.y, i, j, 0, 0,
                      maspow[t], maspow[t], 1, 0, t, 1, 32, 32, 2, 0, false, 0, 0,
                      masdis[t], masdam[t], mastime[t], event2.otkogo, 0, false));
                  }
                  sosta = 0;
                  return;
                }
              }
        }
        break;
    }
  }

  if (construction && flagnewbuild && sostb === 5 && !(sostb === 1 || sostb === 3)) {
    sostb = 0;
    flagnewbuild = false;
  }
  if (construction && maxenerge[1] < energe[1] && maxbuild[125] === numberbuild[125]) {
    maxbuild[125] = b8(maxbuild[125] + 1);
    flagnewbuild = true;
  }
  if (this.flagbuildtank) createtank();
  if (this.flagbuildair) createair();
  createbuild();
};

TDeskTop.prototype.deletegroup = function () {
  var pp, f = true;
  if (viborrobot.elem !== null && viborrobot.last !== null) {
    var chV = chainFromLast(viborrobot);
    for (var iv = 0; iv < chV.length; iv++) {
      pp = chV[iv];
      newowner(pp, myrobot);
      modifpole2(pp.x, pp.y, this.tip);
      fff = true;
    }
    if (myrobot.elem === null && myrobot.last === null) {
      myrobot.elem = viborrobot.elem;
      myrobot.last = viborrobot.last;
      viborrobot.elem = null; viborrobot.last = null;
      f = false;
    }
    if (f) {
      if (myrobot.elem !== null) myrobot.elem.pred = viborrobot.last; else nilWrite('DeleteGroup');
      if (myrobot.elem !== null) viborrobot.last.next = myrobot.elem;
      if (myrobot.last !== null) myrobot.last.next = viborrobot.elem; else nilWrite('DeleteGroup');
      if (myrobot.last !== null) viborrobot.elem.pred = myrobot.last;
      myrobot.last = viborrobot.last;
      viborrobot.elem = null; viborrobot.last = null;
    }
  }
  // BUG (оригинал): флаг f общий для роботов и танков — если список роботов
  // был пуст и его просто «перенесли», выбранные танки не вливаются в mytank
  // и остаются в списке выбранных с владельцем mytank. Такие танки продолжают
  // слушаться приказов, хотя рамки выбора у них нет, а щелчок по ним рвёт
  // список (в DOS — запись по nil-указателю, порча памяти).
  if (vibortank.elem !== null && vibortank.last !== null) {
    var chV = chainFromLast(vibortank);
    for (var iv = 0; iv < chV.length; iv++) {
      pp = chV[iv];
      newowner(pp, mytank);
      modifpole2(pp.x, pp.y, this.tip);
      fff = true;
    }
    if (mytank.elem === null && mytank.last === null) {
      mytank.elem = vibortank.elem;
      mytank.last = vibortank.last;
      vibortank.elem = null; vibortank.last = null;
      f = false;
    }
    if (f) {
      if (mytank.elem !== null) mytank.elem.pred = vibortank.last; else nilWrite('DeleteGroup');
      if (mytank.elem !== null) vibortank.last.next = mytank.elem;
      if (mytank.last !== null) mytank.last.next = vibortank.elem; else nilWrite('DeleteGroup');
      if (mytank.last !== null) vibortank.elem.pred = mytank.last;
      mytank.last = vibortank.last;
      vibortank.elem = null; vibortank.last = null;
    }
  }
  if (viborair.elem !== null && viborair.last !== null) {
    var chV = chainFromLast(viborair);
    for (var iv = 0; iv < chV.length; iv++) {
      pp = chV[iv];
      newowner(pp, myair);
      modifpole2(pp.x, pp.y, this.tip);
      fff = true;
    }
    if (myair.elem === null && myair.last === null) {
      myair.elem = viborair.elem;
      myair.last = viborair.last;
      viborair.elem = null; viborair.last = null;
      return;
    }
    if (myair.elem !== null) myair.elem.pred = viborair.last; else nilWrite('DeleteGroup');
    if (myair.elem !== null) viborair.last.next = myair.elem;
    if (myair.last !== null) myair.last.next = viborair.elem; else nilWrite('DeleteGroup');
    if (myair.last !== null) viborair.elem.pred = myair.last;
    myair.last = viborair.last;
    viborair.elem = null; viborair.last = null;
  }
};

TDeskTop.prototype.creategroup = function (x1, y1, x2, y2) {
  var j, i1, j1, lx, ly, i, t;
  var event = new TEvent();
  if (x1 > x2) { i = x1; x1 = x2; x2 = i; }
  if (y1 > y2) { i = y1; y1 = y2; y2 = i; }
  i1 = b8(round(Math.trunc(x1 / 40)) + polex);
  j1 = b8(round(Math.trunc(y1 / 40)) + poley);
  lx = b8(round(Math.trunc(x2 - x1) / 40));
  ly = b8(round(Math.trunc(y2 - y1) / 40));
  this.deletegroup();
  for (i = i1; i <= i1 + lx; i++)
    for (j = j1; j <= j1 + ly; j++) {
      if (i <= maxx && j <= maxy) {
        t = gp(i, j, 0);
        if (inR(t, 23, 29) || t === 205 || t === 116) {
          event.watch = cmevent;
          event.code = cmwho2;
          event.ras = 0;
          event.pow = 111;
          event.x = i;
          event.y = j;
          this.message(mytank, event);
          if (event.code !== cmitiswho) this.message(myrobot, event);
          if (event.code === cmitiswho) {
            sel = null;
            event.code = cminserttovibor;
            if (event.tip === 23 || inR(event.tip, 26, 29)) this.message(mytank, event);
            if (inR(event.tip, 24, 25)) this.message(myrobot, event);
          }
        }
        t = gp(i, j, 1);
        if (inR(t, 30, 39)) {
          event.watch = cmevent;
          event.code = cmwho2;
          event.pow = 111;
          event.ras = 0;
          event.x = i;
          event.y = j;
          this.message(myair, event);
          if (event.code === cmitiswho) {
            sel = null;
            event.code = cminserttovibor;
            if (event.tip >= 30) this.message(myair, event);
          }
        }
      }
    }
  event.watch = cmnothing;
};

TDeskTop.prototype.puthouse = function (x1, y1, sx, sy, tp) {
  var i, j, r;
  r = true;
  if (x1 + sx + polex - 1 > maxx || y1 + sy + poley - 1 > maxy) return false;
  for (i = x1 + polex; i <= x1 + sx + polex - 1; i++)
    for (j = y1 + poley; j <= y1 + sy + poley - 1; j++) {
      var v = gp(i, j, 0);
      if (v !== 0 && v !== 3 && v !== 4) r = false;
    }
  if (gp(x1 + polex, y1 + poley, 0) === 10 && tp === 112) r = true;
  if (gp(x1 + polex, y1 + poley, 0) !== 10 && tp === 112) r = false;
  return r;
};

TDeskTop.prototype.putevent = function (code) {
  var event = new TEvent();
  event.watch = cmevent;
  event.code = code;
  TGroup.prototype.handleevent.call(this, event);
};

TDeskTop.prototype.panel = function (f) {
  var nn, n, i, j, k, event2 = new TEvent();
  setwsize(0, 0, 640, 480);
  hidemouse();
  if (!f) {
    button(26, 27, false);
    st = str(money[0]);
    setcolor(0);
    outtextxy(xxx + 20 + 2, yyy3 + 3, st);
    setcolor(yellow);
    outtextxy(xxx + 20 + 1, yyy3 + 2, st);
  } else {
    i = 0; j = 0; n = 1; nn = 0;
    drawwindow(520, radary + maxy + 16, 640, 480);
    button(0, 27, false);
    button(25, 27, this.remont);
    button(26, 27, false);
    button(27, 27, false);
    button(98, 29, false);
    button(99, 29, false);
    button(100, 29, false);
    st = str(money[0]);
    setcolor(0);
    outtextxy(xxx + 20 + 2, yyy3 + 3, st);
    setcolor(yellow);
    outtextxy(xxx + 20 + 1, yyy3 + 2, st);
    if (selhouse !== null) {
      event2.watch = cmevent;
      event2.code = cmgetnum;
      event2.komu = selhouse;
      this.message(myhouse, event2);
      if (event2.code === cmitiswho) nn = event2.x;
    }
    for (k = 0; k <= maxicon; k++) {
      if (masflagicon[k]) {
        if (n !== nn) button(n, 29, false);
        switch (k) {
          case 12: if (!masmyflagbuild[112]) button(n, 33, false); break;
          case 13: if (!masmyflagbuild[114]) button(n, 33, false); break;
          case 14: if (!masmyflagbuild[113]) button(n, 33, false); break;
          case 15: if (!masmyflagbuild[116]) button(n, 33, false); break;
          case 16: if (!masmyflagbuild[117]) button(n, 33, false); break;
          case 17: if (!masmyflagbuild[118]) button(n, 33, false); break;
        }
        if (n === nn) button(n, 29, true);
        putsprite(3 + xxx + i * 42, 3 + yyy + j * 42, masicon[k]);
        i++; n++;
        if (i > 1) { j++; i = 0; }
      }
    }
  }
  showmouse();
  setwsize(0, 0, 520, 480);
};

TDeskTop.prototype.showall = function (f) {
  setcolor(white);
  line(520, 0, 520, 480);
  switch (f) {
    case 0: showpole(false); break;
    case 1: case 2: showallpole(false); break;
  }
  if (f !== 2) {
    myhouse.show();
    enemyhouse.show();
    myturret.show();
    enemyturret.show();
    myrobot.show();
    mytank.show();
    enemyrobot.show();
    enemytank.show();
    viborrobot.show();
    vibortank.show();
    smoke2.show();
  }
  switch (f) {
    case 0: showpole(true); break;
    case 1: case 2: showallpole(true); break;
  }
  if (f !== 2) {
    enemyair.show();
    myair.show();
    viborair.show();
    smoke.show();
    rocet.show();
  }
  if (this.flagshowmove) {
    if (this.timeshowmove > 0) {
      modifpole2(this.showmove[2], this.showmove[3], 1);
      if (this.timeshowmove > 2) putsprite(this.showmove[0] - polex * 40, this.showmove[1] - poley * 40, pictmove[0]);
      this.timeshowmove--;
    } else {
      this.flagshowmove = false;
      this.timeshowmove = time14;
    }
  }
};

TDeskTop.prototype.handleevent = function (event) {
  var f, ff, xx, yy, i, j, event3, event2 = new TEvent(), v0, v1;
  f = false; ff = false;
  if (flagcursor === 255 && mousex() < 520) {
    flagcursor = oldflagcursor;
    setcursor(cursor);
  }
  if (this.vibor && cursor !== 0 && flagcursor !== 254) {
    oldflagcursor = flagcursor;
    flagcursor = 254;
    setcursor(0);
  }
  if (flagcursor === 254 && !this.vibor) {
    flagcursor = oldflagcursor;
    setcursor(cursor);
  }
  if (flagcursor !== 255 && mousex() >= 520 && cursor !== 0) {
    oldflagcursor = flagcursor;
    flagcursor = 255;
    setcursor(0);
  }
  if (cursor === 0 && flagcursor !== 1 && (vibortank.elem !== null || viborair.elem !== null) && !chronocur)
    flagcursor = 1;
  if (flagcursor === 1 && vibortank.elem === null && viborair.elem === null) {
    flagcursor = 0;
    cursor = 0;
    setcursor(cursor);
  }
  if (flagcursor === 1 && mousex() < 520 && !chronocur && !flagmenu) {
    xx = idiv(mousex(), 40) + polex;
    yy = idiv(mousey(), 40) + poley;
    v0 = gp(xx, yy, 0); v1 = gp(xx, yy, 1);
    if (inR(v0, 23, 29) || inR(v0, 100, 119) || v0 === 200 || v0 === 205 || inR(v1, 30, 36)) {
      cursor = 0;
      setcursor(cursor);
    } else {
      if (!(inR(v0, 50, 80) || inR(v0, 121, 130) || v0 === 201 || v0 === 206) && !inR(v1, 76, 80)) {
        cursor = 3;
        setcursor(cursor);
      } else {
        setcursor(4);
      }
    }
  }
  if (event.watch === cmevent) {
    switch (event.code) {
      case cmnewhouse: event.otkogo.insert(New(THouse).init2()); return;
      case cmnewtank: event.otkogo.insert(New(TTank).init2()); return;
      case cmnewrobot: event.otkogo.insert(New(TRobot).init2()); return;
      case cmnewair: event.otkogo.insert(New(TAir).init2()); return;
      case cmnewroc: event.otkogo.insert(New(TRocet).init2()); return;
      case cmnewroc2: event.otkogo.insert(New(TRocet2).init2()); return;
      case cmnewsm: event.otkogo.insert(New(TSmoke).init2()); return;
      case cmgetkoord:
        event.x = this.tarx;
        event.y = this.tary;
        break;
      case cmsmoke:
        if (event.mvx === 1) {
          if (event.pow === 1) {
            if (event.tip === 31 || event.tip === 77) {
              if (event.ang === 0 || event.ang === 4) {
                event.y = event.y - 23;
                smoke.insert(New(TSmoke).init(event.x + random(3), event.y + random(5), event.tm2, event.mvy));
                event.y = event.y + 25;
                smoke.insert(New(TSmoke).init(event.x + random(3), event.y + random(5), event.tm2, event.mvy));
              }
              if (event.ang === 2 || event.ang === 6) {
                event.y = event.y - 5;
                event.x = event.x - 13;
                smoke.insert(New(TSmoke).init(event.x + random(3), event.y + random(5), event.tm2, event.mvy));
                event.x = event.x + 25;
                smoke.insert(New(TSmoke).init(event.x + random(3), event.y + random(5), event.tm2, event.mvy));
              }
              if (event.ang === 1 || event.ang === 5) {
                event.x = event.x - 13;
                event.y = event.y - 15;
                smoke.insert(New(TSmoke).init(event.x + random(3), event.y + random(5), event.tm2, event.mvy));
                event.x = event.x + 25;
                event.y = event.y + 25;
                smoke.insert(New(TSmoke).init(event.x + random(3), event.y + random(5), event.tm2, event.mvy));
              }
              if (event.ang === 3 || event.ang === 7) {
                event.x = event.x - 13;
                event.y = event.y + 10;
                smoke.insert(New(TSmoke).init(event.x + random(3), event.y + random(5), event.tm2, event.mvy));
                event.x = event.x + 25;
                event.y = event.y - 25;
                smoke.insert(New(TSmoke).init(event.x + random(3), event.y + random(5), event.tm2, event.mvy));
              }
            } else smoke.insert(New(TSmoke).init(event.x + random(3), event.y + random(5), event.tm2, event.mvy));
          }
        } else {
          if (event.pow === 1) smoke2.insert(New(TSmoke).init(event.x + random(3), event.y + random(5), event.tm2, event.mvy));
          if (event.pow === 2) {
            smoke2.insert(New(TSmoke).init(event.x + random(3) + idiv(event.sx, 2),
              event.y + random(5) + idiv(event.sy, 2) - 10, event.tm2, event.mvy));
            smoke2.insert(New(TSmoke).init(event.x + random(3) + idiv(event.sx, 2) - 20,
              event.y + random(5) + idiv(event.sy, 2) + 10, event.tm2, event.mvy));
            smoke2.insert(New(TSmoke).init(event.x + random(3) + idiv(event.sx, 2) + 20,
              event.y + random(5) + idiv(event.sy, 2) + 10, event.tm2, event.mvy));
          }
        }
        break;
      case cmputhouse:
        enemyhouse.insert(New(THouse).init(event.x, event.y, massize[121][0], massize[121][1], 121, 1, maspow[121], maspow[121]));
        return;
    }
  }
  if (this.flagcloack) {
    if (event.watch === cmmouse && event.button !== 0) event.watch = cmnothing;
    if (event.watch === cmmouse && event.button === 0) this.flagcloack = false;
  }
  if (event.watch === cmmouse) {
    if (event.button === 2 && chronocur) {
      cursor = oldcursor;
      if (oldcursor === 5) cursor = 0;
      setcursor(cursor);
      chronocur = false;
      this.flagcloack = true;
      return;
    }
    if (event.button === 2 && this.remont) {
      cursor = 0;
      setcursor(cursor);
      this.remont = false;
      newpanel[0] = true; newpanel[1] = true;
    }
    if (event.button === 0) {
      if (event.xm > 520 && event.ym > radary + maxy + 15 && !chronocur) {
        j = numicon(event.xm, event.ym);
        if (selhouse !== null && j !== 0) {
          help[1] = true;
          help[0] = true;
          newhelp[page] = true;
          event2.watch = cmevent;
          event2.code = cmgettip;
          event2.komu = selhouse;
          this.message(selhouse, event2);
          if (event2.x === 0) {
            setwsize(0, 0, 640, 480);
            borlandsettextsize(1);
            hidemouse();
            button(0, 27, false);
            this.showHelpText(event2.tip, j);
            showmouse();
          }
          setwsize(0, 0, 520, 480);
        }
      }
      if ((event.xm < 520 && event.ym < radary + maxy + 15) || numicon(event.xm, event.ym) === 0) {
        if (help[page]) {
          setwsize(0, 0, 640, 480);
          hidemouse();
          button(0, 27, false);
          showmouse();
          setwsize(0, 0, 520, 480);
          help[page] = false;
          newhelp[0] = false;
          newhelp[1] = false;
        }
      }
    }
  }

  if (event.watch === cmmouse && event.button === 1 && event.xm > 520 && !chronocur) {
    i = numicon(event.xm, event.ym);
    if (i === 100) {
      event2.watch = cmevent;
      event2.code = cmcloack;
      this.message(viborair, event2);
      this.message(vibortank, event2);
      this.flagcloack = true;
      event.watch = cmnothing;
    }
    if (i === 99) {
      event2.watch = cmevent;
      event2.code = cmallunload;
      this.message(viborair, event2);
      this.message(vibortank, event2);
      this.flagcloack = true;
      event.watch = cmnothing;
    }
    if (i === 98) {
      event2.watch = cmevent;
      event2.code = cmoneunload;
      this.message(viborair, event2);
      this.message(vibortank, event2);
      this.flagcloack = true;
      event.watch = cmnothing;
    }
    if (i === 25) {
      if (this.remont) {
        cursor = 0;
        setcursor(cursor);
      } else {
        cursor = 2;
        setcursor(cursor);
      }
      this.remont = !this.remont;
      if (this.remont) {
        event2.watch = cmevent;  // select:=0
        event2.code = cmunselect;
        this.message(viborair, event2);
        this.message(vibortank, event2);
        this.message(enemytank, event2);
        this.message(enemyair, event2);
        this.message(myturret, event2);
        this.message(enemyturret, event2);
        this.message(enemyhouse, event2);
        this.deletegroup();
      }
      newpanel[0] = true; newpanel[1] = true;
      this.flagcloack = true;
    }
  }
  if (event.watch === cmmouse && event.button === 2 && build) this.message(myhouse, event);
  if (event.watch === cmmouse && this.flagbuildhouse) {
    if (viborair.elem !== null || vibortank.elem !== null) this.deletegroup();
    if (event.button === 0) {
      pereris[0] = true;
      pereris[1] = true;
      hidemouse();
      var cx = idiv(event.xm, 40), cy = idiv(event.ym, 40), tb = this.tipbuild;
      if (this.puthouse(cx, cy, massize[tb][0], massize[tb][1], tb)) {
        if (inR(tb, 110, 116)) putsprite(cx * 40, cy * 40, houses[tb][0]);
        else putsprite(cx * 40, cy * 40, tank[tb][4]);
      } else {
        if (inR(tb, 110, 116)) putsprites(cx * 40, cy * 40, houses[tb][0]);
        else putsprites(cx * 40, cy * 40, tank[tb][4]);
      }
      this.oldmousex[page] = event.xm; this.oldmousey[page] = event.ym;
      showmouse();
    }
    if (event.button === 1) {
      var tb2 = this.tipbuild;
      if (event.xm < 520 && this.puthouse(idiv(event.xm, 40), idiv(event.ym, 40), massize[tb2][0], massize[tb2][1], tb2)) {
        pereris[0] = true;
        pereris[1] = true;
        if (inR(tb2, 110, 116))
          myhouse.insert(New(THouse).init(idiv(event.xm, 40) + polex, idiv(event.ym, 40) + poley,
            massize[tb2][0], massize[tb2][1], tb2, this.rasbuild, maspow[tb2], maspow[tb2]));
        if (inR(tb2, 25, 44)) {
          i = idiv(event.xm, 40) + polex;
          j = idiv(event.ym, 40) + poley;
          myturret.insert(New(TTank).init(i, j, i, j, i, j, 0, 0,
            idiv(maspow[tb2], 1), maspow[tb2], this.rasbuild, 0, tb2, 4, 40, 40, 0, 100, false, 0, 0, 240 + 80, 50, 30, null, 255, false));
        }
        this.flagbuildhouse = false;
        build = false;
        event.watch = cmevent;
        event.code = cmputbuild;
        this.message(this.otkogo, event);
        event.watch = cmnothing;
      }
      event.watch = cmnothing;
    }
  }
  if (event.watch === cmevent) {
    if (event.code === cmiamdied) {
      if (this.flagbuildhouse === true) this.flagbuildhouse = false;
      event.watch = cmnothing;
      pereris[0] = true; pereris[1] = true;
      return;
    }
    if (event.code === cmhouse) {
      this.flagbuildhouse = true;
      this.tipbuild = event.tip;
      this.rasbuild = event.ras;
      this.otkogo = event.otkogo;
      event.watch = cmnothing;
      return;
    }
    if (event.code === cmnohouse) {
      if (this.flagbuildhouse === true) this.flagbuildhouse = false;
      event.watch = cmnothing;
      return;
    }
    if (event.code === cmrobot) {
      event.komu.insert(New(TRobot).init(event.x, event.y, event.newx, event.newy, event.x, event.y, 0, 0,
        idiv(event.pow, 1), event.pow, event.ras, 0, event.tip, event.ang, 37, 37, event.step, event.tm2, event.mov, 0, 0, event.buil));
      event.watch = cmnothing;
      return;
    }
    if (event.code === cmtank) {
      event.komu.insert(New(TTank).init(event.x, event.y, event.newx, event.newy, event.x, event.y, 0, 0,
        idiv(event.pow, 1), event.pow, event.ras, 0, event.tip, event.ang, event.sx, event.sy, event.step, event.tm2,
        event.mov, 0, 0, event.dis, event.dam, event.tim, null, 255, false));
      event.watch = cmnothing;
      return;
    }
    if (event.code === cmair) {
      i = 0;
      if (inR(event.tip, 30, 39))
        event.komu.insert(New(TAir).init(event.x, event.y, event.newx, event.newy, event.x, event.y, 0, 0,
          idiv(event.pow, 1), event.pow, event.ras, 0, event.tip, event.ang, event.sx, event.sy, event.step,
          event.tm2, event.mov, i, i, event.dis, event.dam, event.tim, null, 255, false));
      event.watch = cmnothing;
      return;
    }
  }
  if (event.watch === cmmouse) {
    event3 = event.clone();
    if (this.flagpressmouse &&
        ((this.mousex1 - event.xm < 10 && this.mousey1 - event.ym < 10) &&
         (this.mousey1 - event.ym > -10 || this.mousey1 - event.ym > -10)) &&
        event.button === 0 && event.xm > 520 && !chronocur) {
      this.flagpressmouse = false;
      event.button = 1;
      this.message(myhouse, event);
      event.button = 0;
    }
    if (!this.flagpressmouse) {
      switch (event.button) {
        case 2:
          this.newx = event.xm; this.newy = event.ym;
          if (this.flagbuildhouse) {
            event.watch = cmevent;
            event.code = cmnoputbuild;
            this.message(this.otkogo, event);
            this.flagbuildhouse = false;
            pereris[0] = true;
            pereris[1] = true;
            event.watch = cmnothing;
          }
          if (viborair.elem !== null || vibortank.elem !== null || viborrobot.elem !== null) {
            event2.watch = cmevent;
            event2.code = cmnewgo;
            event2.newx = this.newx;
            event2.newy = this.newy;
            this.message(viborair, event2);
            this.message(vibortank, event2);
            this.message(viborrobot, event2);
            event.watch = cmnothing;

            i = round(Math.trunc(event.xm / 40)) + polex;
            j = round(Math.trunc(event.ym / 40)) + poley;
            if (i <= maxx && j <= maxy) {
              event2.watch = cmevent;
              event2.code = cmwho;
              event2.x = event.xm; event2.y = event.ym;
              this.message(enemyair, event2);
              if (event2.code !== cmitiswho) this.message(enemytank, event2);
              if (event2.code !== cmitiswho) this.message(enemyrobot, event2);
              if (event2.code !== cmitiswho) this.message(enemyturret, event2);
              if (event2.code !== cmitiswho) this.message(enemyhouse, event2);
              if (event2.code === cmitiswho) {
                event2.code = cmattack;
                // (оригинал: event.x мышиного события — мусор из другого варианта записи)
                event2.x = event.x + polex * 40;
                event2.y = event.y + poley * 40;
                this.message(vibortank, event2);
                this.message(viborair, event2);
                this.message(myturret, event2);
                event.watch = cmnothing;
              } else {
                if (!this.flagshowmove) {
                  this.flagshowmove = true;
                  this.showmove[0] = event.xm + polex * 40 - 20;
                  this.showmove[1] = event.ym + poley * 40 - 20;
                  this.showmove[2] = idiv(event.xm + polex * 40 - 20, 40);
                  this.showmove[3] = idiv(event.ym + poley * 40 - 20, 40);
                }
              }
            }
          }
          if (sel !== null && inR(sel.tip, 40, 45)) {
            i = round(Math.trunc(event.xm / 40)) + polex;
            j = round(Math.trunc(event.ym / 40)) + poley;
            if (i <= maxx && j <= maxy && i - polex <= 12) {
              event2.watch = cmevent;
              event2.code = cmwho;
              event2.x = event.xm; event2.y = event.ym;
              this.message(enemyair, event2);
              if (event2.code !== cmitiswho) this.message(enemytank, event2);
              if (event2.code !== cmitiswho) this.message(enemyrobot, event2);
              if (event2.code !== cmitiswho) this.message(enemyturret, event2);
              if (event2.code === cmitiswho) {
                event2.code = cmattack;
                event2.x = event.x + polex * 40;
                event2.y = event.y + poley * 40;
                this.message(sel, event2);
              }
            }
          }
          break;
        case 1:
          if (event.xm > 520 && event.xm > radarx && event.xm < radarx + maxx &&
              event.ym > radary && event.ym < radary + maxy) {
            polex = event.xm - radarx - 6;
            poley = event.ym - radary - 5;
            this.flagradar[0] = true;
            this.flagradar[1] = true;
            if (polex < 0) polex = 0;
            if (poley < 0) poley = 0;
            if (polex > maxx - 12) polex = maxx - 12;
            if (poley > maxy - 11) poley = maxy - 11;
            pereris[0] = true;
            pereris[1] = true;
          } else if (!this.flagpressmouse) {
            this.mousex1 = event.xm;
            this.mousey1 = event.ym;
            this.flagpressmouse = true;
            event.watch = cmnothing;
          }
          break;
      }
    } else {
      if (event.button === 1) {
        if ((this.mousex1 - event.xm > 10 || this.mousex1 - event.xm < -10 ||
             this.mousey1 - event.ym > 10 || this.mousey1 - event.ym < -10) && !this.remont && !chronocur) {
          setcolor(white);
          pereris[0] = true;
          pereris[1] = true;
          this.vibor = true;
          rectangle(this.mousex1, this.mousey1, event.xm, event.ym, 15, 15);
          putsprite(event.xm - 9, event.ym - 11, pict[8]);
          this.mousex2 = event.xm; this.mousey2 = event.ym;
          this.flagramka = true;
          event.watch = cmnothing;
        } else {
          event.watch = cmnothing;
        }
      }
      if (event.button === 0) {
        this.flagpressmouse = false;
        if ((this.mousex1 - event.xm > 10 || this.mousex1 - event.xm < -10 ||
             this.mousey1 - event.ym > 10 || this.mousey1 - event.ym < -10) && !this.remont && !chronocur) {
          event2 = event.clone();
          event.watch = cmevent;  // select:=0
          event.code = cmunselect;
          this.message(viborair, event);
          this.message(vibortank, event);
          this.message(viborrobot, event2);
          this.message(enemytank, event);
          this.message(enemyrobot, event);
          this.message(enemyair, event);
          this.message(myturret, event);
          this.message(enemyturret, event);
          event.assign(event2);
          this.creategroup(this.mousex1, this.mousey1, event.xm, event.ym);
          this.flagramka = false;
          this.vibor = false;
          pereris[0] = true;
          pereris[1] = true;
        } else {
          this.handleClick(event, event3, ff);
        }
      }
    }
  }

  if (event.watch === cmkey && !this.remont && !flagchrono) {
    var k = event.key;
    if (k === ch('c') || k === ch('C') || k === ch('с') || k === ch('С')) {
      event2.watch = cmevent;
      event2.code = cmcloack;
      this.message(viborair, event2);
      this.message(vibortank, event2);
    } else if (k === ch('e') || k === ch('E') || k === ch('у') || k === ch('У')) {
      if (!chronocur) {
        this.unselectAll(event2, true);
        this.deletegroup();
        this.creategroup(0, 0, 520, 480);
      }
    } else if (k === ch('r') || k === ch('R') || k === ch('к') || k === ch('К')) {
      if (!chronocur) {
        this.unselectAll(event2, true);
        this.deletegroup();
      }
    } else if (inR(k, ch('0'), ch('9'))) {
      if (!chronocur) {
        event2.watch = cmevent;  // select:=0
        event2.code = cmunselect;
        this.message(enemytank, event2);
        this.message(enemyrobot, event2);
        this.message(enemyair, event2);
        this.message(myturret, event2);
        this.message(enemyturret, event2);
        this.message(myhouse, event2);
        this.message(enemyhouse, event2);
        this.message(viborair, event2);
        this.message(vibortank, event2);
        this.message(viborrobot, event2);
        sel = null;
        selhouse = null;
        this.deletegroup();
        event2.watch = cmevent;
        event2.code = cmtogroup;
        event2.tip = nomer(k);
        this.message(mytank, event2);
        this.message(myair, event2);
        this.message(myrobot, event2);
        this.message(vibortank, event2);
        this.message(viborair, event2);
        this.message(viborrobot, event2);
      }
    } else if (k === 77) {
      if (polex < maxx - 12) { polex++; f = true; this.flagradar[0] = true; this.flagradar[1] = true; }
    } else if (k === 75) {
      if (polex > 0) { polex--; f = true; this.flagradar[0] = true; this.flagradar[1] = true; }
    } else if (k === 80) {
      if (poley < maxy - 11) { poley++; f = true; this.flagradar[0] = true; this.flagradar[1] = true; }
    } else if (k === 72) {
      if (poley > 0) { poley--; f = true; this.flagradar[0] = true; this.flagradar[1] = true; }
    }
    event.watch = cmnothing;
  }
  if (event.watch === cmmouse && event.button === 0 && !flagchrono) {
    if (event.ym === 0 || event.ym === 1) {
      if (this.arrow === 0) {
        hidemouse();
        this.arrow = 3;
      }
      if (!f) putsprite(mousex(), mousey(), pict[12]);
      f = true;
      if (this.scrolltime > 0) this.scrolltime--;
      else if (poley > 0) {
        poley--;
        this.flagradar[0] = true;
        this.flagradar[1] = true;
      }
    } else if (event.ym === 480 || event.ym === 479) {
      if (this.arrow === 0) {
        hidemouse();
        this.arrow = 4;
      }
      if (!f) putsprite(mousex(), mousey() - 22, pict[13]);
      f = true;
      if (this.scrolltime > 0) this.scrolltime--;
      else if (poley < maxy - 11) {
        poley++;
        this.flagradar[0] = true;
        this.flagradar[1] = true;
      }
    }
    if (event.xm === 0 || event.xm === 1) {
      if (this.arrow === 0) {
        hidemouse();
        this.arrow = 5;
      }
      if (!f) putsprite(mousex(), mousey(), pict[14]);
      f = true;
      if (this.scrolltime > 0) this.scrolltime--;
      else if (polex > 0) {
        polex--;
        this.flagradar[0] = true;
        this.flagradar[1] = true;
      }
    } else if (event.xm === 640 || event.xm === 639) {
      if (this.arrow === 0) {
        hidemouse();
        this.arrow = 6;
      }
      // BUG (оригинал): стрелка рисуется у x=618, за пределами окна 0..520 —
      // при прокрутке вправо курсор просто пропадает.
      if (!f) putsprite(mousex() - 21, mousey(), pict[13]);
      f = true;
      if (this.scrolltime > 0) this.scrolltime--;
      else if (polex < maxx - 12) {
        polex++;
        this.flagradar[0] = true;
        this.flagradar[1] = true;
      }
    }
    var mx = mousex(), my = mousey();
    if (this.arrow !== 0 && mx !== 0 && mx !== 1 && mx !== 640 && mx !== 639 &&
        my !== 479 && my !== 480 && my !== 0 && my !== 1) {
      this.arrow = 0;
      showmouse();
      pereris[0] = true;
      pereris[1] = true;
    }
  }
  if (f) {
    pereris[0] = true;
    pereris[1] = true;
    this.scrolltime = time;
  }
};

// «отменить выделение у всех» (повторяющийся блок cmUnSelect)
TDeskTop.prototype.unselectAll = function (event2, withHouses) {
  event2.watch = cmevent;  // select:=0
  event2.code = cmunselect;
  this.message(viborair, event2);
  this.message(vibortank, event2);
  this.message(viborrobot, event2);
  this.message(enemytank, event2);
  this.message(enemyrobot, event2);
  this.message(enemyair, event2);
  this.message(myturret, event2);
  this.message(enemyturret, event2);
  if (withHouses) {
    this.message(myhouse, event2);
    this.message(enemyhouse, event2);
  }
};

// подсказка с названием постройки при наведении на иконку
TDeskTop.prototype.showHelpText = function (tip, j) {
  function t(dx, dy, s) { borlandouttextxy(xxx2 + dx, yyy2 + dy, R(s), littp); }
  switch (tip) {
    case 111:
      if (j <= 8) putsprite(xxx2 + 20, yyy2 + 1, masicon[j + 9]);
      setcolor(119);
      switch (j) {
        case 1: t(13, 37, 'Сбор.двор'); break;
        case 2: t(10, 37, 'Эл.станция'); break;
        case 3: t(15, 37, 'Добытчик'); break;
        case 4: t(1, 37, 'Танковый зав.'); break;
        case 5: t(12, 37, 'Авиазавод'); break;
        case 6: t(12, 30, 'Ремонтная'); t(15, 37, 'площадка'); break;
        case 7: t(23, 37, 'Пушка'); break;
        case 8: t(18, 37, 'Зенитка'); break;
      }
      break;
    case 112:
      if (j <= 2) putsprite(xxx2 + 20, yyy2 + 1, masicon[j + 17]);
      setcolor(119);
      switch (j) {
        case 1: t(20, 30, 'Легкий'); t(12, 37, 'харвестер'); break;
        case 2: t(17, 30, 'Тяжелый'); t(12, 37, 'харвестер'); break;
      }
      break;
    case 113:
      if (j <= 6) putsprite(xxx2 + 20, yyy2 + 1, masicon[j - 1]);
      setcolor(119);
      switch (j) {
        case 1: t(17, 30, 'Средний'); t(7, 37, 'истребитель'); break;
        case 2: t(20, 30, 'Легкий'); t(7, 37, 'истребитель'); break;
        case 3: t(17, 37, 'Крейсер'); break;
        case 4: t(12, 37, 'Невидимка'); break;
        case 5: t(15, 37, 'Детектор'); break;
        case 6: t(13, 37, 'Транспорт'); break;
      }
      break;
    case 114:
      if (j <= 5) putsprite(xxx2 + 20, yyy2 + 1, masicon[j + 19]);
      setcolor(119);
      switch (j) {
        case 1: t(20, 30, 'Легкий'); t(26, 37, 'танк'); break;
        case 2: t(16, 30, 'Средний'); t(26, 37, 'танк'); break;
        case 3: t(16, 30, 'Тяжелый'); t(26, 37, 'танк'); break;
        case 4: t(2, 37, 'Осадный танк'); break;
        case 5: t(3, 37, '"Chrono" танк'); break;
      }
      break;
  }
};

// одиночный щелчок левой кнопкой (отпускание без перетаскивания)
TDeskTop.prototype.handleClick = function (event, event3, ff) {
  var i, j, xx, yy, event2 = new TEvent(), v;
  i = event.xm; j = event.ym;
  xx = idiv(i, 40) + polex;
  yy = idiv(j, 40) + poley;
  if (i < 520 && chronocur && inSet(gp(xx, yy, 0), [0, 3, 4])) {
    event2.watch = cmevent;
    event2.code = cmchrono;
    event2.x = xx; event2.y = yy;
    this.message(vibortank, event2);
  }
  if (!this.remont && xx <= maxx && yy <= maxy && !chronocur) {
    v = gp(xx, yy, 1);
    if (inR(v, 30, 39) || v === 0) {
      if (idiv(i, 40) < polex + 13) {
        event2.watch = cmevent;
        event2.code = cmwho;
        event2.x = i; event2.y = j;
        this.message(myair, event2);
        if (event2.code !== cmitiswho) this.message(viborair, event2);
        if (event2.code === cmitiswho) {
          sel = null;
          ff = true;
          event2.watch = cmevent;  // select:=0
          event2.code = cmunselect;
          this.message(enemytank, event2);
          this.message(enemyrobot, event2);
          this.message(enemyair, event2);
          this.message(myturret, event2);
          this.message(enemyturret, event2);
          if (!shift()) {
            this.message(viborair, event2);
            this.message(vibortank, event2);
            this.message(viborrobot, event2);
            this.deletegroup();
          }
          event2.code = cminserttovibor;
          if (event2.tip >= 30) this.message(myair, event2);
          event.watch = cmnothing;
          return;
        }
      }
    }
  }
  if (!this.remont && xx <= maxx && yy <= maxy && !chronocur) {
    v = gp(idiv(i, 40) + polex, idiv(j, 40) + poley, 1);
    if (inR(v, 76, 85) || v === 0) {
      if (idiv(i, 40) < polex + 13) {
        event2.watch = cmevent;
        event2.code = cmwho;
        event2.x = i; event2.y = j;
        this.message(enemyair, event2);
        if (event2.code === cmitiswho) {
          sel = null;
          ff = true;
          event2.watch = cmevent;  // select:=0
          event2.code = cmunselect;
          this.unselectAll(event2, false);
          this.deletegroup();
          event2.otkogo.select = 1;
          event.watch = cmnothing;
          return;
        }
      }
    }
  }
  if (!ff && xx <= maxx && yy <= maxy && !chronocur) {
    v = gp(idiv(i, 40) + polex, idiv(j, 40) + poley, 0);
    if (inR(v, 110, 119) || v === 200 || v === 205) {
      event2 = event3.clone();
      if (event2.button === 0) event2.button = 1;
      this.message(myhouse, event2);
      this.unselectAll(event2, false);
      this.deletegroup();
    } else if (inR(v, 120, 129) || v === 201 || v === 206) {
      if (!this.remont) {
        event2 = event3.clone();
        if (event2.button === 0) event2.button = 1;
        this.message(enemyhouse, event2);
        event2.watch = cmevent;  // select:=0
        event2.code = cmunselect;
        this.message(viborair, event2);
        this.message(vibortank, event2);
        this.message(enemytank, event2);
        this.message(enemyrobot, event2);
        this.message(viborrobot, event2);
        this.message(enemyair, event2);
        this.message(myturret, event2);
        this.message(enemyturret, event2);
        this.deletegroup();
      }
    }
    v = gp(idiv(i, 40) + polex, idiv(j, 40) + poley, 0);
    if (inR(v, 23, 29) || v === 205 || v === 116) {
      if (idiv(i, 40) < polex + 13 && !this.remont) {
        event2.watch = cmevent;
        event2.code = cmwho;
        event2.x = i; event2.y = j;
        this.message(mytank, event2);
        if (event2.code !== cmitiswho) this.message(vibortank, event2);
        if (event2.code !== cmitiswho) this.message(myrobot, event2);
        if (event2.code !== cmitiswho) this.message(viborrobot, event2);
        if (event2.code === cmitiswho) {
          sel = null;
          event2.watch = cmevent;  // select:=0
          event2.code = cmunselect;
          this.message(enemytank, event2);
          this.message(enemyrobot, event2);
          this.message(enemyair, event2);
          this.message(myturret, event2);
          this.message(enemyturret, event2);
          if (!shift()) {
            this.message(viborair, event2);
            this.message(vibortank, event2);
            this.message(viborrobot, event2);
            this.deletegroup();
          }
          event2.code = cminserttovibor;
          if (inR(event2.tip, 24, 25)) this.message(myrobot, event2);
          else this.message(mytank, event2);
        }
      }
    } else if (inR(v, 60, 69) || v === 206 || v === 226) {
      if (idiv(i, 40) < polex + 13 && !this.remont) {
        event2.watch = cmevent;
        event2.code = cmwho;
        event2.x = i; event2.y = j;
        this.message(enemytank, event2);
        if (event2.code !== cmitiswho) this.message(enemyrobot, event2);
        if (event2.code === cmitiswho) {
          sel = null;
          event2.watch = cmevent;  // select:=0
          event2.code = cmunselect;
          this.message(viborair, event2);
          this.message(vibortank, event2);
          this.message(viborrobot, event2);
          this.message(enemytank, event2);
          this.message(enemyair, event2);
          this.message(enemyrobot, event2);
          this.message(myturret, event2);
          this.message(enemyturret, event2);
          event2.otkogo.select = 1;
          this.deletegroup();
        }
      }
    } else if (inR(v, 40, 42)) {
      if (idiv(i, 40) < polex + 13) {
        event2.watch = cmevent;
        event2.code = cmwho;
        event2.x = i; event2.y = j;
        this.message(myturret, event2);
        if (event2.code === cmitiswho) {
          sel = null;
          this.unselectAll(event2, false);
          this.deletegroup();
          event2.code = cmselect;
          this.message(event2.otkogo, event2);
        }
      }
    } else if (inR(v, 70, 75)) {
      if (idiv(i, 40) < polex + 13 && !this.remont) {
        event2.watch = cmevent;
        event2.code = cmwho;
        event2.x = i; event2.y = j;
        this.message(enemyturret, event2);
        if (event2.code === cmitiswho) {
          sel = null;
          this.unselectAll(event2, false);
          this.deletegroup();
          event2.code = cmselect;
          this.message(event2.otkogo, event2);
        }
      }
    }
  }
};

// ------------------------------- главный цикл run ---------------------------
TDeskTop.prototype.runstart = function () {
  flaggo = false; flaggo2 = false;
  this.show2();
};
// одна итерация repeat..until flagQuit
TDeskTop.prototype.runiteration = function () {
  var event = this.runEvent;
  sp2(polex, poley, 1); sp2(polex + 1, poley, 1);
  sp2(polex, poley + 1, 1); sp2(polex + 1, poley + 1, 1);
  // отладочный вывод, оставшийся в оригинале (виден в левом верхнем углу)
  st = str(memavail());
  outtextxy(10, 10, st);
  st = str(sostb);
  outtextxy(16, 20, st);
  st = str(money[1]);
  outtextxy(30, 20, st);
  st = str(sostt);
  outtextxy(8, 30, 't' + st);
  st = str(sosta);
  outtextxy(8, 40, 'a' + st);
  st = str(koltank);
  outtextxy(30, 30, st);
  st = str(kolair);
  outtextxy(30, 40, st);
  st = str(kolpatrol[0]);
  outtextxy(50, 30, st);
  st = str(kolpatrol[1]);
  outtextxy(50, 40, st);

  if (!flagmenu) {
    flaggo = false;
    flaggo2 = false;
    hidemouse();
    setvisualpage(page);
    page = 1 - page;
    showmouse();
    // WaitVBL — здесь кончается кадр (см. main.js)
    hidemouse();
    setactivepage(page);
    showmouse();

    if (pereris[page]) {
      this.showall(2);
      pereris[page] = false;
    }
    if (this.flagradar[page]) {
      setwsize(0, 0, 640, 480);
      radar2();
      this.flagradar[page] = false;
      setwsize(0, 0, 520, 480);
    }
    if (newmoney[page]) {
      this.panel(false);
      newmoney[page] = false;
    }
    if (newpanel[page]) {
      this.panel(true);
      newpanel[page] = false;
    }
    this.showall(0);
    if (victory) {
      borlandsettextsize(2);
      setcolor(119);
      hidemouse();
      borlandouttextxy(50, 230, R('Вы выиграли!!!'), gothp);
      showmouse();
      if (timetoquit > 0) timetoquit--;
    }
    if (failed) {
      borlandsettextsize(2);
      setcolor(119);
      hidemouse();
      borlandouttextxy(60, 230, R('Вы проиграли'), gothp);
      showmouse();
      if (timetoquit > 0) timetoquit--;
    }
    this.intellect();
    this.getevent(event);
    this.handleevent(event);
    this.putevent(cmfire);
    if (deleting.elem !== null) disposeAll(deleting, function (g) { return g.last.next; });
    if (key === 27 && !flagchrono) {
      play('wav2.wav');
      flagmenu = true;
      newmenu[0] = true;
      setvisualpage(0);
      setactivepage(0);
      oldcursor = cursor;
      cursor = 1;
      setcursor(cursor);
      if (this.arrow !== 0) showmouse();
    }
    if (flagplay !== 10000) {
      play2();
      flagplay = 10000;
    }
  } else {
    if (newmenu[0]) {
      newmenu[0] = false;
      if (menu.sost !== 7 && menu.sost !== 9) {
        setvisualpage(1);
        setactivepage(0);
        this.showall(1);
        if (victory) {
          borlandsettextsize(2);
          setcolor(119);
          borlandouttextxy(50, 230, R('Вы выиграли!!!'), gothp);
        }
        if (failed) {
          borlandsettextsize(2);
          setcolor(119);
          borlandouttextxy(60, 230, R('Вы проиграли'), gothp);
        }
      }
      menu.show();
      if (menu.sost !== 7 && menu.sost !== 9) setvisualpage(0);
    }
    this.getevent(event);
    menu.handleevent(event);
  }
};

TDeskTop.prototype.createall = function () {
  sostb = 0; sostt = 0; sosta = 0;
  this.stb = New(TStack).init();
  this.stt = New(TStack).init();
  this.sta = New(TStack).init();
  myhouse = New(TGroup).init(); this.insert(myhouse);
  enemyhouse = New(TGroup).init(); this.insert(enemyhouse);
  myturret = New(TGroup).init(); this.insert(myturret);
  enemyturret = New(TGroup).init(); this.insert(enemyturret);
  myrobot = New(TGroup).init(); this.insert(myrobot);
  mytank = New(TGroup).init(); this.insert(mytank);
  enemyrobot = New(TGroup).init(); this.insert(enemyrobot);
  enemytank = New(TGroup).init(); this.insert(enemytank);
  viborrobot = New(TGroup).init(); this.insert(viborrobot);
  vibortank = New(TGroup).init(); this.insert(vibortank);
  rocet2 = New(TGroup).init(); this.insert(rocet2);
  myair = New(TGroup).init(); this.insert(myair);
  enemyair = New(TGroup).init(); this.insert(enemyair);
  viborair = New(TGroup).init(); this.insert(viborair);
  deleting = New(TGroup).init(); this.insert(deleting);
  smoke = New(TGroup).init(); this.insert(smoke);
  smoke2 = New(TGroup).init(); this.insert(smoke2);
  rocet = New(TGroup).init(); this.insert(rocet);
};

TDeskTop.prototype.init = function () {
  this.last = null; this.elem = null; this.owner = null; this.next = null;
  polex = 0; poley = 0;
  this.scrolltime = time;
  this.flagpressmouse = false;
  this.flagramka = false;
  this.flagbuildhouse = false;
  this.otkogo = null;
  this.flagradar[0] = false; this.flagradar[1] = false;
  newpanel[0] = true; newpanel[1] = true;
  newmoney[0] = false; newmoney[1] = false;
  this.flagcloack = false;
  this.flagbuildtank = false;
  this.flagbuildair = false;
  this.remont = false;
  flagtiberium = 0;
  this.arrow = 0;
  this.vibor = false;
  this.flagshowmove = false;
  this.timeshowmove = time14;

  this.createall();

  myhouse.insert(New(THouse).init(2, 2, massize[111][0], massize[111][1], 111, 0, 1000, 1000));
  myhouse.insert(New(THouse).init(15, 15, massize[113][0], massize[113][1], 113, 0, 1000, 1000));
  myhouse.insert(New(THouse).init(3, 8, massize[114][0], massize[114][1], 114, 0, 300, 500));
  myhouse.insert(New(THouse).init(9, 7, massize[112][0], massize[112][1], 112, 0, 400, 500));
  myhouse.insert(New(THouse).init(15, 19, massize[116][0], massize[116][1], 116, 0, 400, 500));
  myhouse.insert(New(THouse).init(3, 13, massize[115][0], massize[115][1], 115, 0, 500, 1000));

  enemyhouse.insert(New(THouse).init(79, 67, massize[121][0], massize[121][1], 121, 1, 1400, 1500));
  enemyhouse.insert(New(THouse).init(10, 15, massize[126][0], massize[126][1], 126, 1, 400, 500));
  return this;
};

TDeskTop.prototype.show = function () {
  var ch = chainFromLast(this);
  for (var i = 0; i < ch.length; i++) ch[i].show();
};

TDeskTop.prototype.done = function () {
  var pp;
  dispose(this.stb);
  dispose(this.stt);
  dispose(this.sta);
  if (this.elem !== null) {
    pp = this.last;
    disposeAll(this, function (g) { return g.elem.next; });
  }
};

TDeskTop.prototype.doneall = function () {
  this.done2(myhouse);
  this.done2(enemyhouse);
  this.done2(rocet2);
  this.done2(rocet);
  this.done2(myair);
  this.done2(enemyair);
  this.done2(vibortank);
  this.done2(viborrobot);
  this.done2(viborair);
  this.done2(myrobot);
  this.done2(mytank);
  this.done2(enemyrobot);
  this.done2(enemytank);
  this.done2(smoke);
  this.done2(smoke2);
  this.done2(myturret);
  this.done2(enemyturret);
};
TDeskTop.prototype.done2 = function (pp) {
  if (pp.elem !== null) disposeAll(pp, function (g) { return g.last.next; });
};

TDeskTop.prototype.save = function () {
  var w, i, event2 = new TEvent();
  savefile = w = new BinWriter();
  w.pstr(filestr, 33, filestrTail);

  w.i16(polex);
  w.i16(poley);
  w.i16(prioritet);
  w.i16(rocetstep);
  for (i = 0; i <= 130; i++) w.i16(mastimebuild[i]);
  for (i = 0; i <= 130; i++) w.i16(masdam[i]);
  for (i = 0; i <= 130; i++) w.i16(maspow[i]);
  for (i = 0; i <= 130; i++) w.i16(masdis[i]);
  for (i = 0; i <= 130; i++) w.i16(mastime[i]);
  w.bytes(pole);
  w.bytes(pole3);

  w.pstr('save constant', 14);
  w.ptr(selhouse);
  w.ptr(sel);
  // save constant's
  for (i = 0; i <= maxicon; i++) w.bool(masflagicon[i]);
  w.bool(flagquit);
  w.bool(newmenu[0]); w.bool(newmenu[1]);
  w.u8(flagtiberium);
  w.bool(flag67); w.bool(zahvat); w.bool(attack); w.bool(complet);
  w.bool(patrol[0]); w.bool(patrol[1]);
  for (i = 120; i <= 126; i++) w.u8(numberbuild[i]);
  for (i = 120; i <= 126; i++) w.u8(maxbuild[i]);
  for (i = 121; i <= 126; i++) w.bool(masflagbuild[i]);
  for (i = 111; i <= 118; i++) w.bool(masmyflagbuild[i]);
  w.i16(koltank); w.i16(kolair);
  w.i16(kolpatrol[0]); w.i16(kolpatrol[1]);
  w.i16(inckol[0]); w.i16(inckol[1]);
  w.bool(notiberium); w.bool(flagnewbuild); w.bool(construction);
  w.i32(money[0]); w.i32(money[1]);
  w.bool(flagmenu); w.bool(flagquit); w.bool(failed); w.bool(victory);
  // end save constan's

  w.pstr('save desktop', 13);
  // save desktop
  TObject.prototype.save.call(this);
  w.i16(this.scrolltime);
  w.u8(this.rasbuild); w.u8(this.tipbuild);
  w.ptr(this.otkogo);
  w.i16(this.oldmousex[0]); w.i16(this.oldmousex[1]);
  w.i16(this.oldmousey[0]); w.i16(this.oldmousey[1]);
  w.i16(this.mousex1); w.i16(this.mousey1); w.i16(this.mousex2); w.i16(this.mousey2);
  w.bool(this.flagbuildhouse); w.bool(this.flagramka); w.bool(this.flagpressmouse);
  w.bool(this.flagbuildtank); w.bool(this.flagbuildair);
  w.i16(this.timebuildh); w.i16(this.tbuildh);
  w.i16(this.timebuildt); w.i16(this.tbuildt);
  w.i16(this.timebuilda); w.i16(this.tbuilda);
  w.ptr(this.builder);
  w.i16(this.xm2); w.i16(this.ym2);
  w.u8(this.arrow); w.bool(this.vibor);
  w.i16(this.tarx); w.i16(this.tary);
  w.bool(this.flagshowmove); w.u8(this.timeshowmove);
  for (i = 0; i < 4; i++) w.i16(this.showmove[i]);
  // end save desktop

  // save all stek
  w.u8(sostb); w.u8(sostt); w.u8(sosta);
  this.stb.save();
  this.stt.save();
  this.sta.save();
  menu.save();

  event2.watch = cmevent;
  event2.code = cmsave;
  this.message(myhouse, event2);
  this.message(enemyhouse, event2);
  this.message(myturret, event2);
  this.message(enemyturret, event2);
  this.message(mytank, event2);
  this.message(enemyrobot, event2);
  this.message(enemytank, event2);
  this.message(myrobot, event2);
  this.message(vibortank, event2);
  this.message(rocet2, event2);
  this.message(myair, event2);
  this.message(enemyair, event2);
  this.message(viborair, event2);
  this.message(smoke, event2);
  this.message(smoke2, event2);
  this.message(rocet, event2);

  fsWrite(filename, w.result());
  savefile = null;

  event2.watch = cmevent;
  event2.code = cmrestore;
  this.message(menu, event2);
};

TDeskTop.prototype.load2 = function () {
  var r, i, num, event2 = new TEvent();
  var data = fsRead(filename);
  if (!data) return;                          // IOResult<>0
  flagloadfile = true;
  this.doneall();
  loadfile = r = new BinReader(data);
  r.bytes(33);

  polex = r.i16();
  poley = r.i16();
  prioritet = r.i16();
  rocetstep = r.i16();
  for (i = 0; i <= 130; i++) mastimebuild[i] = r.i16();
  for (i = 0; i <= 130; i++) masdam[i] = r.i16();
  for (i = 0; i <= 130; i++) maspow[i] = r.i16();
  for (i = 0; i <= 130; i++) masdis[i] = r.i16();
  for (i = 0; i <= 130; i++) mastime[i] = r.i16();
  pole.set(r.bytes(POLE_SIZE));
  pole3.set(r.bytes(POLE_SIZE));

  r.bytes(14);
  selhouse = r.ptr();
  sel = r.ptr();
  // load constant's
  for (i = 0; i <= maxicon; i++) masflagicon[i] = r.bool();
  flagquit = r.bool();
  newmenu[0] = r.bool(); newmenu[1] = r.bool();
  flagtiberium = r.u8();
  flag67 = r.bool(); zahvat = r.bool(); attack = r.bool(); complet = r.bool();
  patrol[0] = r.bool(); patrol[1] = r.bool();
  for (i = 120; i <= 126; i++) numberbuild[i] = r.u8();
  for (i = 120; i <= 126; i++) maxbuild[i] = r.u8();
  for (i = 121; i <= 126; i++) masflagbuild[i] = r.bool();
  for (i = 111; i <= 118; i++) masmyflagbuild[i] = r.bool();
  koltank = r.i16(); kolair = r.i16();
  kolpatrol[0] = r.i16(); kolpatrol[1] = r.i16();
  inckol[0] = r.i16(); inckol[1] = r.i16();
  notiberium = r.bool(); flagnewbuild = r.bool(); construction = r.bool();
  money[0] = r.i32(); money[1] = r.i32();
  flagmenu = r.bool(); flagquit = r.bool(); failed = r.bool(); victory = r.bool();
  // end load constan's

  r.bytes(13);
  // load desktop
  TObject.prototype.load2.call(this);
  this.scrolltime = r.i16();
  this.rasbuild = r.u8(); this.tipbuild = r.u8();
  this.otkogo = r.ptr();
  this.oldmousex[0] = r.i16(); this.oldmousex[1] = r.i16();
  this.oldmousey[0] = r.i16(); this.oldmousey[1] = r.i16();
  this.mousex1 = r.i16(); this.mousey1 = r.i16(); this.mousex2 = r.i16(); this.mousey2 = r.i16();
  this.flagbuildhouse = r.bool(); this.flagramka = r.bool(); this.flagpressmouse = r.bool();
  this.flagbuildtank = r.bool(); this.flagbuildair = r.bool();
  this.timebuildh = r.i16(); this.tbuildh = r.i16();
  this.timebuildt = r.i16(); this.tbuildt = r.i16();
  this.timebuilda = r.i16(); this.tbuilda = r.i16();
  this.builder = r.ptr();
  this.xm2 = r.i16(); this.ym2 = r.i16();
  this.arrow = r.u8(); this.vibor = r.bool();
  this.tarx = r.i16(); this.tary = r.i16();
  this.flagshowmove = r.bool(); this.timeshowmove = r.u8();
  for (i = 0; i < 4; i++) this.showmove[i] = r.i16();
  // end load desktop

  sostb = r.u8(); sostt = r.u8(); sosta = r.u8();
  this.stb.load2();
  this.stt.load2();
  this.sta.load2();
  menu.load2();

  event2.watch = cmevent;
  event2.code = cmloadf;
  var order = [[myhouse, cmnewhouse], [enemyhouse, cmnewhouse], [myturret, cmnewtank], [enemyturret, cmnewtank],
               [mytank, cmnewtank], [enemyrobot, cmnewrobot], [enemytank, cmnewtank], [myrobot, cmnewrobot],
               [vibortank, cmnewtank], [rocet2, cmnewroc2], [myair, cmnewair], [enemyair, cmnewair],
               [viborair, cmnewair], [smoke, cmnewsm], [smoke2, cmnewsm], [rocet, cmnewroc]];
  for (i = 0; i < order.length; i++) {
    r.bytes(10);
    num = r.i16();
    this.newob(order[i][0], order[i][1], num);
    event2.watch = cmevent;
    event2.code = cmloadf;
    this.message(order[i][0], event2);
  }
  loadfile = null;

  this.nastroika(this, 'otkogo', myhouse);
  var h = { p: selhouse };
  this.nastroika(h, 'p', myhouse); selhouse = h.p;
  h = { p: sel };
  this.nastroika(h, 'p', myhouse); sel = h.p;

  event2.watch = cmevent;
  event2.code = cmrestore;
  this.message(myhouse, event2);
  this.message(enemyhouse, event2);
  this.message(myturret, event2);
  this.message(enemyturret, event2);
  this.message(mytank, event2);
  this.message(enemytank, event2);
  this.message(enemyrobot, event2);
  this.message(myrobot, event2);
  this.message(vibortank, event2);
  this.message(rocet2, event2);
  this.message(myair, event2);
  this.message(enemyair, event2);
  this.message(viborair, event2);
  this.message(smoke, event2);
  this.message(smoke2, event2);
  this.message(rocet, event2);

  this.nastroika(this, 'builder', enemyhouse);
  hidemouse();
  newpanel[0] = true;
  newpanel[1] = true;
  pereris[0] = true;
  pereris[1] = true;
  this.show2();

  flagloadfile = false;

  flagmenu = true;
  newmenu[0] = true;
  menu.sost = 0;
  cursor = 1;
  oldcursor = 0;
  setcursor(cursor);
  flagcursor = 0;
  oldflagcursor = 1;
};

TDeskTop.prototype.newob = function (p, cod, zzz) {
  var event2 = new TEvent();
  event2.watch = cmevent;
  event2.code = cod;
  event2.otkogo = p;
  for (var i = 1; i <= zzz; i++) this.message(desk, event2);
};

// =============================== Program =====================================
// Главная программа как конечный автомат (внешний repeat..until quit и
// внутренний run).
var prog = { state: 'init', long: 0 };

function waitSoundEnd() { prog.waitSound = true; }

function programInit() {
  quit = false;
  prog.long = memavail();
  randomize();
  sel = null; selhouse = null;
  fff = false;
  initmas();
  initall();
  modulInit();
  loadpict();
  palet = New(TPalet).init();
  menu = New(TMenu).init();
  stroka = New(TStr).init();
  prog.state = 'gamestart';
}

function programGameStart() {
  sel = null; selhouse = null;
  fff = false;
  initpole(pole, pole3);
  timetoquit = 150;
  cursor = 1;
  oldcursor = 0;
  setcursor(cursor);
  flagcursor = 0;
  oldflagcursor = 1;
  chronocur = false;
  desk = New(TDeskTop).init();
  desk.runstart();
  prog.state = 'run';
}

function programGameEnd() {
  dispose(desk);
  hidemouse();
  prioritet = 30;
  rocetstep = 40;
  initmas();
  number[0] = number[1] = 0;
  maxnumber[0] = maxnumber[1] = 0;
  flagquit = false;
  newmenu[0] = true;
  flagtiberium = 0;
  flag67 = false;
  zahvat = false;      // нечто, связанное с захватом ресурсов
  attack = false;      // атака
  complet = true;
  patrol[0] = true;
  patrol[1] = true;
  for (var i = 120; i <= 126; i++) { numberbuild[i] = 0; maxbuild[i] = 0; }
  maxbuild[122] = 1;
  maxbuild[123] = 1;
  maxbuild[124] = 1;
  maxbuild[125] = 5;
  masflagbuild[121] = true;
  masflagbuild[122] = false;
  masflagbuild[123] = false;
  masflagbuild[124] = false;
  masflagbuild[125] = true;
  masflagbuild[126] = false;
  masmyflagbuild[111] = true;
  masmyflagbuild[112] = false;
  masmyflagbuild[113] = false;
  masmyflagbuild[114] = false;
  masmyflagbuild[115] = true;
  masmyflagbuild[116] = false;
  masmyflagbuild[117] = false;
  masmyflagbuild[118] = false;
  koltank = 5;
  kolair = 5;
  kolpatrol[0] = 10; kolpatrol[1] = 10;
  inckol[0] = 5; inckol[1] = 5;
  notiberium = false;
  flagnewbuild = false;
  construction = false;
  money[0] = 9000; money[1] = 9000;
  flagmenu = true;
  menu.sost = 4;
  flagquit = false;
  failed = false;
  victory = false;
  flagloadfile = false;
  prog.state = quit ? 'exit' : 'gamestart';
}

function programExit() {
  dispose(palet);
  dispose(menu);
  dispose(stroka);
  setcolor(white);
  var s = str(prog.long - memavail());
  outtextxy(50, 50, s);
  setactivepage(1 - page);
  outtextxy(50, 50, s);
  prog.leak = prog.long - memavail() !== 0;
  if (prog.leak) sound(500);
  prog.state = prog.leak ? 'leakwait' : 'dos';
}
