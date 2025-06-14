export const runtime = 'nodejs';

import { defineEventHandler, useQuery } from 'h3';
import axios from 'axios';

const API_BASE = 'https://opendata.cwa.gov.tw/api/v1/rest/datastore/A-B0062-001';

export default defineEventHandler(async (event) => {
  const { location } = useQuery(event);
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

    // 進入記錄陣列
    const locations = res.data.records.locations.location;
    const todayEntry = locations.flatMap((l: any) => l.time || [])
      .find((t: any) => t.Date === today);

    if (!todayEntry) {
      return { error: '今日資料尚未提供' };
    }

    return {
      location: locName,
      '民用曙光始（明相出）': todayEntry.BeginCivilTwilightTime,
      '太陽過中天': todayEntry.SunTransitTime,
      '民用暮光終（最後一道光）': todayEntry.EndCivilTwilightTime
    };
  } catch (err) {
    console.error('太陽時間查詢失敗', err);
    return { error: '查詢失敗，請稍後再試' };
  }
});
