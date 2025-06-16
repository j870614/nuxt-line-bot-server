export const runtime = 'nodejs';

import { defineEventHandler, getQuery } from 'h3';
import axios from 'axios';

const API_BASE = 'https://opendata.cwa.gov.tw/api/v1/rest/datastore/A-B0062-001';

export default defineEventHandler(async (event) => {
  const { location } = getQuery(event);
  const locName = location || '宜蘭縣';
  const today = new Date().toISOString().slice(0, 10);

  try {
    const res = await axios.get(API_BASE, {
      params: {
        Authorization: process.env.CWA_API_KEY,
        timeFrom: today,
        timeTo: today,
        CountyName: locName,
        format: 'JSON'
      }
    });

    console.log('☀️ CWA API 回傳資料:', JSON.stringify(res.data, null, 2));

    const locations = res.data.records.locations.location;
    const todayEntry = locations.flatMap((l: any) => l.time || [])
      .find((t: any) => t.Date === today);

    if (!todayEntry) {
      return { error: '今日資料尚未提供' };
    }

    return {
      location: locName,
      明相出: todayEntry.BeginCivilTwilightTime,
      過中天: todayEntry.SunTransitTime,
      最後一道光: todayEntry.EndCivilTwilightTime
    };
  } catch (err) {
    console.error('❌ 太陽時間查詢失敗', err);
    return { error: '查詢失敗，請稍後再試' };
  }
});
