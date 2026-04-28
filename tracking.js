// DARKDMTR Play Tracking - Supabase Connected
const SUPABASE_URL = 'https://udiqhlymaoqyhbbpvdiw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkaXFobHltYW9xeWhiYnB2ZGl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMDE4NjUsImV4cCI6MjA5Mjg3Nzg2NX0.iowFxdCZA6aw2SdAlxhIIDOCS3_-qAMZV2_zQ9sousg';

const playedTracks = new Set();

async function loadPlayCounts() {
  try {
    const res = await fetch(SUPABASE_URL + '/rest/v1/track_counts?select=track_id,plays', {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
      }
    });
    if (!res.ok) return;
    const data = await res.json();
    data.forEach(function(row) {
      var el = document.querySelector('[data-play-count="' + row.track_id + '"]');
      if (el) el.textContent = row.plays;
    });
  } catch (err) {
    console.error('Play count load failed:', err);
  }
}

async function logPlay(trackId) {
  if (playedTracks.has(trackId)) return;
  playedTracks.add(trackId);
  try {
    const sessionId = sessionStorage.getItem('dmtr_sid') || (function(){
      var s = Math.random().toString(36).slice(2);
      sessionStorage.setItem('dmtr_sid', s);
      return s;
    })();
    const listenerId = localStorage.getItem('dmtr_lid') || (function(){
      var l = Math.random().toString(36).slice(2);
      localStorage.setItem('dmtr_lid', l);
      return l;
    })();
    await fetch(SUPABASE_URL + '/rest/v1/rpc/log_play', {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        p_track_id: trackId,
        p_session_id: sessionId,
        p_listener_id: listenerId,
        p_referrer: document.referrer || 'direct',
        p_user_agent: navigator.userAgent.slice(0, 200)
      })
    });
    // Update display immediately
    var el = document.querySelector('[data-play-count="' + trackId + '"]');
    if (el) el.textContent = (parseInt(el.textContent) || 0) + 1;
  } catch (err) {
    console.error('logPlay failed:', err);
  }
}

// Wire up audio elements on load
document.addEventListener('DOMContentLoaded', function() {
  loadPlayCounts();
  var audios = document.querySelectorAll('audio');
  audios.forEach(function(audio, idx) {
    var trackId = 'track_' + String(idx + 1).padStart(2, '0');
    audio.addEventListener('play', function() {
      logPlay(trackId);
    });
  });
});
