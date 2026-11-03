import type { Question } from '@solo/content-schema';

// Extracted data; see content/SOURCE.md.
const data = [
  {
    "id": "zh:placement:tone-distinction",
    "kind": "choice",
    "prompt": {
      "vi": "“mā” và “mà” khác nhau ở điểm nào?"
    },
    "options": [
      {
        "vi": "Phụ âm đầu"
      },
      {
        "vi": "Thanh điệu"
      },
      {
        "vi": "Nguyên âm"
      }
    ],
    "correctIndex": 1,
    "group": "0",
    "category": "tone-distinction",
    "extensions": {
      "zh:category-label": {
        "vi": "Thanh điệu"
      }
    },
    "provenance": {
      "source": {
        "file": "mockup/onboarding-course.js",
        "declaration": "quiz",
        "line": 7,
        "item": 0
      },
      "license": "LicenseRef-SoloLanguages-Proprietary",
      "attribution": "© SoloLanguages. All rights reserved.",
      "version": "bc95722",
      "retrievedAt": "2026-11-02T08:40:09.589Z"
    }
  },
  {
    "id": "zh:placement:pinyin",
    "kind": "choice",
    "prompt": {
      "vi": "你好 viết Pinyin là gì?"
    },
    "options": [
      "nín hāo",
      "ní hào",
      "nǐ hǎo"
    ],
    "correctIndex": 2,
    "group": "0",
    "category": "pinyin",
    "extensions": {
      "zh:category-label": {
        "vi": "Pinyin"
      }
    },
    "provenance": {
      "source": {
        "file": "mockup/onboarding-course.js",
        "declaration": "quiz",
        "line": 7,
        "item": 1
      },
      "license": "LicenseRef-SoloLanguages-Proprietary",
      "attribution": "© SoloLanguages. All rights reserved.",
      "version": "bc95722",
      "retrievedAt": "2026-11-02T08:40:09.589Z"
    }
  },
  {
    "id": "zh:placement:vocabulary-hsk1",
    "kind": "choice",
    "prompt": {
      "vi": "谢谢 nghĩa là gì?"
    },
    "options": [
      {
        "vi": "Cảm ơn"
      },
      {
        "vi": "Xin lỗi"
      },
      {
        "vi": "Tạm biệt"
      }
    ],
    "correctIndex": 0,
    "group": "1",
    "category": "vocabulary-hsk1",
    "extensions": {
      "zh:category-label": {
        "vi": "Từ vựng HSK 1"
      }
    },
    "provenance": {
      "source": {
        "file": "mockup/onboarding-course.js",
        "declaration": "quiz",
        "line": 7,
        "item": 2
      },
      "license": "LicenseRef-SoloLanguages-Proprietary",
      "attribution": "© SoloLanguages. All rights reserved.",
      "version": "bc95722",
      "retrievedAt": "2026-11-02T08:40:09.589Z"
    }
  },
  {
    "id": "zh:placement:simple-sentence",
    "kind": "choice",
    "prompt": {
      "vi": "我是学生。nghĩa là gì?"
    },
    "options": [
      {
        "vi": "Tôi đi học."
      },
      {
        "vi": "Tôi là học sinh."
      },
      {
        "vi": "Tôi có sách."
      }
    ],
    "correctIndex": 1,
    "group": "1",
    "category": "simple-sentence",
    "extensions": {
      "zh:category-label": {
        "vi": "Câu đơn"
      }
    },
    "provenance": {
      "source": {
        "file": "mockup/onboarding-course.js",
        "declaration": "quiz",
        "line": 7,
        "item": 3
      },
      "license": "LicenseRef-SoloLanguages-Proprietary",
      "attribution": "© SoloLanguages. All rights reserved.",
      "version": "bc95722",
      "retrievedAt": "2026-11-02T08:40:09.589Z"
    }
  },
  {
    "id": "zh:placement:comparison",
    "kind": "choice",
    "prompt": {
      "vi": "Chọn từ đúng: 他比我___。"
    },
    "options": [
      "很高",
      "最高",
      "高"
    ],
    "correctIndex": 2,
    "group": "2",
    "category": "comparison",
    "extensions": {
      "zh:category-label": {
        "vi": "Ngữ pháp so sánh"
      }
    },
    "provenance": {
      "source": {
        "file": "mockup/onboarding-course.js",
        "declaration": "quiz",
        "line": 7,
        "item": 4
      },
      "license": "LicenseRef-SoloLanguages-Proprietary",
      "attribution": "© SoloLanguages. All rights reserved.",
      "version": "bc95722",
      "retrievedAt": "2026-11-02T08:40:09.589Z"
    }
  },
  {
    "id": "zh:placement:conjunction",
    "kind": "choice",
    "prompt": {
      "vi": "“因为…所以…” diễn tả quan hệ gì?"
    },
    "options": [
      {
        "vi": "Nguyên nhân – kết quả"
      },
      {
        "vi": "Tương phản"
      },
      {
        "vi": "Điều kiện"
      }
    ],
    "correctIndex": 0,
    "group": "2",
    "category": "conjunction",
    "extensions": {
      "zh:category-label": {
        "vi": "Liên từ"
      }
    },
    "provenance": {
      "source": {
        "file": "mockup/onboarding-course.js",
        "declaration": "quiz",
        "line": 7,
        "item": 5
      },
      "license": "LicenseRef-SoloLanguages-Proprietary",
      "attribution": "© SoloLanguages. All rights reserved.",
      "version": "bc95722",
      "retrievedAt": "2026-11-02T08:40:09.589Z"
    }
  },
  {
    "id": "zh:placement:advanced-conjunction",
    "kind": "choice",
    "prompt": {
      "vi": "虽然下雨了，___他还是去跑步了。"
    },
    "options": [
      "所以",
      "但是",
      "如果"
    ],
    "correctIndex": 1,
    "group": "3",
    "category": "advanced-conjunction",
    "extensions": {
      "zh:category-label": {
        "vi": "Liên từ nâng cao"
      }
    },
    "provenance": {
      "source": {
        "file": "mockup/onboarding-course.js",
        "declaration": "quiz",
        "line": 7,
        "item": 6
      },
      "license": "LicenseRef-SoloLanguages-Proprietary",
      "attribution": "© SoloLanguages. All rights reserved.",
      "version": "bc95722",
      "retrievedAt": "2026-11-02T08:40:09.589Z"
    }
  },
  {
    "id": "zh:placement:vocabulary",
    "kind": "choice",
    "prompt": {
      "vi": "“差不多” nghĩa gần nhất là gì?"
    },
    "options": [
      {
        "vi": "Rất khác nhau"
      },
      {
        "vi": "Không đủ"
      },
      {
        "vi": "Gần như, xấp xỉ"
      }
    ],
    "correctIndex": 2,
    "group": "3",
    "category": "vocabulary",
    "extensions": {
      "zh:category-label": {
        "vi": "Từ vựng"
      }
    },
    "provenance": {
      "source": {
        "file": "mockup/onboarding-course.js",
        "declaration": "quiz",
        "line": 7,
        "item": 7
      },
      "license": "LicenseRef-SoloLanguages-Proprietary",
      "attribution": "© SoloLanguages. All rights reserved.",
      "version": "bc95722",
      "retrievedAt": "2026-11-02T08:40:09.589Z"
    }
  }
] satisfies Question[];

export default data;
