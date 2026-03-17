function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('학생회실(상담실) 예약 시스템')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function getSheet(name) { return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name); }
function getSettings() { return getSheet('설정').getRange('B3:B7').getValues().flat().filter(String); }

function getSafeDateString(val) {
  if (!val) return "";
  if (val instanceof Date) return Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd");
  return val.toString().trim().split('T')[0];
}

function getSafeTimeString(val) {
  if (!val) return "";
  if (val instanceof Date) return Utilities.formatDate(val, Session.getScriptTimeZone(), "HH:mm");
  let str = val.toString().trim();
  if (str.length >= 5) return str.substring(0, 5);
  return str;
}

function addWeeks(dateStr, weeks) {
  let parts = dateStr.split('-');
  let d = new Date(parts[0], parts[1] - 1, parts[2]);
  d.setDate(d.getDate() + (weeks * 7));
  let yyyy = d.getFullYear();
  let mm = String(d.getMonth() + 1).padStart(2, '0');
  let dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function getWeeklySchedule(startDateStr, endDateStr, adminPw = '') {
  const sheet = getSheet('설정');
  const realAdminPw = sheet.getRange('B2').getValue().toString().trim();
  const isAdminVerified = (adminPw === realAdminPw);

  const db = getSheet('예약DB');
  const data = db.getDataRange().getValues();
  
  let results = [];
  let todaysRes = [];
  const todayStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");

  for (let i = 1; i < data.length; i++) {
    let resDate = getSafeDateString(data[i][1]);
    
    if (resDate === todayStr) {
      todaysRes.push({ startTime: getSafeTimeString(data[i][2]), endTime: getSafeTimeString(data[i][3]) });
    }
    
    if (resDate >= startDateStr && resDate <= endDateStr) {
      let name = data[i][4].toString();
      if (!isAdminVerified && name.length > 0) name = name.slice(0, -1) + '*';
      results.push({
        id: data[i][0].toString(), date: resDate,
        startTime: getSafeTimeString(data[i][2]), endTime: getSafeTimeString(data[i][3]),
        name: name, purpose: data[i][5].toString()
      });
    }
  }
  return { isAdmin: isAdminVerified, reservations: results, todaysRes: todaysRes };
}

function addReservation(data) {
  const sheet = getSheet('설정');
  const commonPw = sheet.getRange('B1').getValue().toString().trim();
  const adminEmail = sheet.getRange('B8').getValue().toString().trim(); 
  
  if (data.commonPw.trim() !== commonPw) return { success: false, message: '공통 예약 비밀번호가 일치하지 않습니다.' };
  if (data.startTime >= data.endTime) return { success: false, message: '종료 시간이 시작 시간보다 빠르거나 같을 수 없습니다.' };

  const db = getSheet('예약DB');
  const dbData = db.getDataRange().getValues();
  
  let targetDates = [];
  for (let w = 0; w < data.repeatWeeks; w++) { targetDates.push(addWeeks(data.date, w)); }

  for (let tDate of targetDates) {
    for (let i = 1; i < dbData.length; i++) {
      let existDate = getSafeDateString(dbData[i][1]);
      if (existDate === tDate) {
        let existStart = getSafeTimeString(dbData[i][2]);
        let existEnd = getSafeTimeString(dbData[i][3]);
        if (data.startTime < existEnd && data.endTime > existStart) {
          return { success: false, message: `⚠️ [${tDate}] 해당 시간에 이미 다른 예약이 존재하여 취소되었습니다.` };
        }
      }
    }
  }

  let rowsToAppend = [];
  // 📌 이메일 본문에 PIN 번호 안내 추가 및 명칭 변경
  let emailBody = `${data.name}님의 학생회실(상담실) 예약이 확정되었습니다.\n\n`;
  emailBody += `🔑 내 예약 PIN 번호: ${data.pin} (추후 수정/취소 시 필요합니다.)\n\n`;
  emailBody += `[예약 상세 내역]\n`;

  for (let tDate of targetDates) {
    const resId = 'RES-' + new Date().getTime() + '-' + Math.floor(Math.random() * 10000);
    rowsToAppend.push([ resId, tDate, data.startTime, data.endTime, data.name, data.purpose, data.pin, new Date().toLocaleString(), data.email || "" ]);
    emailBody += `- ${tDate} ${data.startTime} ~ ${data.endTime} (${data.purpose})\n`;
  }

  if (rowsToAppend.length > 0) db.getRange(db.getLastRow() + 1, 1, rowsToAppend.length, rowsToAppend[0].length).setValues(rowsToAppend);

  let emailErrors = [];
  const subject = `[학생회실(상담실) 예약 완료] ${data.name}님의 예약 확인`;
  
  if (data.email) { try { GmailApp.sendEmail(data.email, subject, emailBody); } catch(e) { emailErrors.push(`예약자 메일 실패: ${e.message}`); } }
  if (adminEmail) { try { GmailApp.sendEmail(adminEmail, `[새로운 예약 알림] ${data.name}님 학생회실 등록`, emailBody); } catch(e) { emailErrors.push(`관리자 메일 실패: ${e.message}`); } }
  
  let returnMessage = `총 ${targetDates.length}건의 예약이 성공적으로 완료되었습니다.`;
  if (emailErrors.length > 0) returnMessage += `\n(일부 알림 메일 발송 제외)`;

  return { success: true, message: returnMessage };
}

function getMyReservations(name, pin) {
  const db = getSheet('예약DB');
  const data = db.getDataRange().getValues();
  let myRes = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][4].toString().trim() === name.trim() && data[i][6].toString().trim() === pin.trim()) {
      myRes.push({
        id: data[i][0].toString(), date: getSafeDateString(data[i][1]),
        startTime: getSafeTimeString(data[i][2]), endTime: getSafeTimeString(data[i][3]), purpose: data[i][5].toString()
      });
    }
  }
  return myRes;
}

function deleteReservation(id, pin, adminPw = '') {
  const db = getSheet('예약DB');
  const data = db.getDataRange().getValues();
  const settingSheet = getSheet('설정');
  const realAdminPw = settingSheet.getRange('B2').getValue().toString().trim();
  const adminEmail = settingSheet.getRange('B8').getValue().toString().trim();
  const isAdmin = (adminPw === realAdminPw);

  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString() === id) {
      if (isAdmin || data[i][6].toString().trim() === pin.trim()) {
        let cancelDate = getSafeDateString(data[i][1]), cancelStart = getSafeTimeString(data[i][2]), cancelEnd = getSafeTimeString(data[i][3]);
        let cancelName = data[i][4].toString(), cancelEmail = data[i][8] ? data[i][8].toString().trim() : "";
        db.deleteRow(i + 1);

        // 📌 취소 메일 명칭 변경
        let cancelBody = `${cancelName}님의 학생회실(상담실) 예약이 취소(삭제)되었습니다.\n\n[취소 내역]\n- ${cancelDate} ${cancelStart} ~ ${cancelEnd}`;
        if (cancelEmail) { try { GmailApp.sendEmail(cancelEmail, `[학생회실 예약 취소] ${cancelName}님 취소 확인`, cancelBody); } catch(e) {} }
        if (adminEmail) { try { GmailApp.sendEmail(adminEmail, `[예약 취소 알림] ${cancelName}님 학생회실 일정 취소`, cancelBody); } catch(e) {} }

        return { success: true, message: '예약이 정상적으로 취소되었습니다.' };
      } else {
        return { success: false, message: 'PIN 번호가 일치하지 않습니다.' };
      }
    }
  }
  return { success: false, message: '해당 예약을 찾을 수 없거나 이미 삭제되었습니다.' };
}
