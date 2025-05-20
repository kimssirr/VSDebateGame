const topicsByDate = {
  '2025-05-19': {
    topics: ['여름', '겨울'],
    translated: ['summer', 'winter']
  },
  '2025-05-20': {
    topics: ['단팥호빵', '야채호빵'],
    translated: ['steamed bun', 'vegetable bun'] // 'vegetable bun'은 검색결과가 거의 없어 'steamed bun'으로 통합하는 것도 고려 가능
  },
  '2025-05-21': {
    topics: ['팥 붕어빵', '슈크림 붕어빵'],
    translated: ['fish-shaped pastry', 'custard pastry'] // 또는 'Korean street food', 'taiyaki'
  },
  '2025-05-22': {
    topics: ['용의 꼬리', '뱀의 머리'],
    translated: ['dragon tail', 'snake head'] // 직역 외에 검색 결과는 적음
  },
  '2025-05-23': {
    topics: ['바다', '산'],
    translated: ['ocean', 'mountains']
  },
  '2025-05-24': {
    topics: ['돈', '시간'],
    translated: ['money', 'time']
  },
  '2025-05-25': {
    topics: ['사이다', '콜라'],
    translated: ['soda', 'cola'] // 'soda can' 등으로 구체화하면 더 잘 나옴
  },
  '2025-05-26': {
    topics: ['아이폰', '갤럭시'],
    translated: ['iPhone', 'Samsung phone']
  },
  '2025-05-27': {
    topics: ['찍어 먹기', '부어 먹기'],
    translated: ['dipping sauce', 'pouring sauce']
  },
  '2025-05-28': {
    topics: ['소주', '맥주'],
    translated: ['soju', 'beer'] // 'soju' 검색결과 적지만 있음
  },
  '2025-05-29': {
    topics: ['미래로 가기', '과거로 가기'],
    translated: ['future city', 'retro style'] // 이미지 검색 의도에 맞게 보완
  },
  '2025-05-30': {
    topics: ['사자', '호랑이'],
    translated: ['lion', 'tiger']
  },
  '2025-05-31': {
    topics: ['고양이', '강아지'],
    translated: ['cat', 'puppy'] // 'dog'도 대체 가능
  },
  '2025-06-01': {
    topics: ['딱딱 복숭아', '물렁 복숭아'],
    translated: ['crunchy peach', 'soft peach'] // 둘 다 검색결과 적음 → 'fresh peach', 'juicy peach' 추천
  }
};



export default topicsByDate;
