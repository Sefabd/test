const { memData, saveDbJson } = require('./config/db');
memData.satisfaction_surveys = [];
(memData.complaints || []).forEach(c => {
  delete c.rating;
  delete c.avg_rating;
  delete c.rating_count;
  delete c.rating_vote_count;
  delete c.rating_comment;
});
saveDbJson();
console.log('✅ Temizlik tamamlandı.');
