import type { Stage } from '@solo/content-schema';

// Extracted data; see content/SOURCE.md.
const data = [
  {
    "id": "zh:stage:foundation",
    "courseCode": "hsk",
    "order": 0,
    "frameworkCode": "hsk-3.0",
    "levelCode": null,
    "labels": {
      "vi": "Nền tảng"
    },
    "extensions": {
      "zh:roadmap-band": {
        "id": "zh:roadmap-band:foundation",
        "short": "P0",
        "groupId": "zh:roadmap-group:foundation",
        "hours": 15,
        "goals": {
          "vi": "Đọc đúng Pinyin, nghe và nói đúng 4 thanh, viết nét cơ bản."
        },
        "can": [
          {
            "vi": "Đọc được mọi âm tiết Pinyin"
          },
          {
            "vi": "Phân biệt 4 thanh, thanh nhẹ và biến điệu (3-3, 不, 一)"
          },
          {
            "vi": "Viết 8 nét cơ bản theo quy tắc thứ tự nét"
          },
          {
            "vi": "Nhận diện 30 bộ thủ thông dụng"
          }
        ],
        "units": [
          {
            "vi": "Thanh mẫu"
          },
          {
            "vi": "Vận mẫu"
          },
          {
            "vi": "4 thanh & thanh nhẹ"
          },
          {
            "vi": "Biến điệu thanh"
          },
          {
            "vi": "Nét cơ bản & thứ tự nét"
          },
          {
            "vi": "30 bộ thủ đầu tiên"
          }
        ],
        "methods": [
          {
            "vi": "Cặp thanh điệu"
          },
          {
            "vi": "Shadowing"
          },
          {
            "vi": "Học chữ theo thành phần"
          }
        ],
        "skills": [
          {
            "vi": "Nghe"
          },
          {
            "vi": "Nói"
          },
          {
            "vi": "Viết"
          }
        ],
        "provenance": {
          "source": {
            "file": "mockup/hsk-roadmap.js",
            "declaration": "bands",
            "line": 6,
            "item": 0
          },
          "license": "LicenseRef-SoloLanguages-Proprietary",
          "attribution": "© SoloLanguages. All rights reserved.",
          "version": "bc95722",
          "retrievedAt": "2026-11-02T08:40:09.589Z"
        }
      },
      "zh:onboarding-band": {
        "id": "zh:onboarding-band:foundation",
        "categories": {
          "vi": "PHASE 0"
        },
        "descriptions": {
          "vi": "Chưa biết tiếng Trung. Bắt đầu từ Pinyin, thanh điệu và nét chữ."
        },
        "provenance": {
          "source": {
            "file": "mockup/onboarding-course.js",
            "declaration": "bands",
            "line": 5,
            "item": 0
          },
          "license": "LicenseRef-SoloLanguages-Proprietary",
          "attribution": "© SoloLanguages. All rights reserved.",
          "version": "bc95722",
          "retrievedAt": "2026-11-02T08:40:09.589Z"
        }
      }
    },
    "provenance": {
      "source": {
        "file": "mockup/language.js",
        "declaration": "hskNames",
        "line": 45,
        "item": 0
      },
      "license": "LicenseRef-SoloLanguages-Proprietary",
      "attribution": "© SoloLanguages. All rights reserved.",
      "version": "bc95722",
      "retrievedAt": "2026-11-02T08:40:09.589Z"
    }
  },
  {
    "id": "zh:stage:hsk1",
    "courseCode": "hsk",
    "order": 1,
    "frameworkCode": "hsk-3.0",
    "levelCode": "HSK1",
    "labels": {
      "vi": "HSK 1"
    },
    "extensions": {
      "zh:roadmap-band": {
        "id": "zh:roadmap-band:hsk1",
        "short": "1",
        "groupId": "zh:roadmap-group:elementary",
        "hours": 60,
        "counts": {
          "syllables": 269,
          "characters": 300,
          "words": 500,
          "grammarPoints": 48,
          "handwrittenCharacters": 100,
          "verified": false
        },
        "goals": {
          "vi": "Giao tiếp rất cơ bản về bản thân và nhu cầu hằng ngày."
        },
        "can": [
          {
            "vi": "Chào hỏi, giới thiệu bản thân và gia đình"
          },
          {
            "vi": "Hỏi đáp số lượng, giá tiền, ngày giờ"
          },
          {
            "vi": "Đọc câu ngắn có Pinyin hỗ trợ"
          },
          {
            "vi": "Viết tay 100 chữ thường gặp"
          }
        ],
        "units": [
          {
            "vi": "Chào hỏi & giới thiệu"
          },
          {
            "vi": "Số đếm, ngày, giờ"
          },
          {
            "vi": "Gia đình & nghề nghiệp"
          },
          {
            "vi": "Ăn uống & mua sắm"
          },
          {
            "vi": "Đi lại & phương hướng"
          },
          {
            "vi": "Sở thích & thời tiết"
          }
        ],
        "methods": [
          {
            "vi": "SRS từ & chữ"
          },
          {
            "vi": "Học từ trong câu mẫu"
          },
          {
            "vi": "Viết tay chữ cốt lõi"
          }
        ],
        "skills": [
          {
            "vi": "Nghe"
          },
          {
            "vi": "Nói"
          },
          {
            "vi": "Đọc"
          },
          {
            "vi": "Viết"
          }
        ],
        "provenance": {
          "source": {
            "file": "mockup/hsk-roadmap.js",
            "declaration": "bands",
            "line": 6,
            "item": 1
          },
          "license": "LicenseRef-SoloLanguages-Proprietary",
          "attribution": "© SoloLanguages. All rights reserved.",
          "version": "bc95722",
          "retrievedAt": "2026-11-02T08:40:09.589Z"
        }
      },
      "zh:onboarding-band": {
        "id": "zh:onboarding-band:hsk1",
        "categories": {
          "vi": "SƠ CẤP"
        },
        "descriptions": {
          "vi": "Biết Pinyin, chào hỏi và giới thiệu bản thân đơn giản."
        },
        "provenance": {
          "source": {
            "file": "mockup/onboarding-course.js",
            "declaration": "bands",
            "line": 5,
            "item": 1
          },
          "license": "LicenseRef-SoloLanguages-Proprietary",
          "attribution": "© SoloLanguages. All rights reserved.",
          "version": "bc95722",
          "retrievedAt": "2026-11-02T08:40:09.589Z"
        }
      }
    },
    "provenance": {
      "source": {
        "file": "mockup/language.js",
        "declaration": "hskNames",
        "line": 45,
        "item": 1
      },
      "license": "LicenseRef-SoloLanguages-Proprietary",
      "attribution": "© SoloLanguages. All rights reserved.",
      "version": "bc95722",
      "retrievedAt": "2026-11-02T08:40:09.589Z"
    }
  },
  {
    "id": "zh:stage:hsk2",
    "courseCode": "hsk",
    "order": 2,
    "frameworkCode": "hsk-3.0",
    "levelCode": "HSK2",
    "labels": {
      "vi": "HSK 2"
    },
    "extensions": {
      "zh:roadmap-band": {
        "id": "zh:roadmap-band:hsk2",
        "short": "2",
        "groupId": "zh:roadmap-group:elementary",
        "hours": 80,
        "counts": {
          "syllables": 468,
          "characters": 600,
          "words": 1272,
          "grammarPoints": 129,
          "handwrittenCharacters": 200,
          "verified": false
        },
        "goals": {
          "vi": "Trao đổi đơn giản trong tình huống quen thuộc."
        },
        "can": [
          {
            "vi": "Mô tả thói quen và kế hoạch"
          },
          {
            "vi": "Hỏi đường, đặt phòng, mua vé"
          },
          {
            "vi": "Đọc đoạn ngắn không cần Pinyin"
          },
          {
            "vi": "Viết 3–5 câu về một chủ đề"
          }
        ],
        "units": [
          {
            "vi": "Thói quen hằng ngày"
          },
          {
            "vi": "Đi khám bệnh"
          },
          {
            "vi": "Du lịch & khách sạn"
          },
          {
            "vi": "So sánh & mô tả"
          },
          {
            "vi": "Kế hoạch cuối tuần"
          }
        ],
        "methods": [
          {
            "vi": "Truyện phân cấp mức 1"
          },
          {
            "vi": "Cặp thanh điệu nâng cao"
          },
          {
            "vi": "Nhật ký 3 câu"
          }
        ],
        "skills": [
          {
            "vi": "Nghe"
          },
          {
            "vi": "Nói"
          },
          {
            "vi": "Đọc"
          },
          {
            "vi": "Viết"
          }
        ],
        "provenance": {
          "source": {
            "file": "mockup/hsk-roadmap.js",
            "declaration": "bands",
            "line": 6,
            "item": 2
          },
          "license": "LicenseRef-SoloLanguages-Proprietary",
          "attribution": "© SoloLanguages. All rights reserved.",
          "version": "bc95722",
          "retrievedAt": "2026-11-02T08:40:09.589Z"
        }
      },
      "zh:onboarding-band": {
        "id": "zh:onboarding-band:hsk2",
        "categories": {
          "vi": "SƠ CẤP"
        },
        "descriptions": {
          "vi": "Trao đổi ngắn về sinh hoạt hằng ngày."
        },
        "provenance": {
          "source": {
            "file": "mockup/onboarding-course.js",
            "declaration": "bands",
            "line": 5,
            "item": 2
          },
          "license": "LicenseRef-SoloLanguages-Proprietary",
          "attribution": "© SoloLanguages. All rights reserved.",
          "version": "bc95722",
          "retrievedAt": "2026-11-02T08:40:09.589Z"
        }
      }
    },
    "provenance": {
      "source": {
        "file": "mockup/language.js",
        "declaration": "hskNames",
        "line": 45,
        "item": 2
      },
      "license": "LicenseRef-SoloLanguages-Proprietary",
      "attribution": "© SoloLanguages. All rights reserved.",
      "version": "bc95722",
      "retrievedAt": "2026-11-02T08:40:09.589Z"
    }
  },
  {
    "id": "zh:stage:hsk3",
    "courseCode": "hsk",
    "order": 3,
    "frameworkCode": "hsk-3.0",
    "levelCode": "HSK3",
    "labels": {
      "vi": "HSK 3"
    },
    "extensions": {
      "zh:roadmap-band": {
        "id": "zh:roadmap-band:hsk3",
        "short": "3",
        "groupId": "zh:roadmap-group:elementary",
        "hours": 120,
        "counts": {
          "syllables": 608,
          "characters": 900,
          "words": 2245,
          "grammarPoints": 210,
          "handwrittenCharacters": 300,
          "verified": false
        },
        "goals": {
          "vi": "Giao tiếp về học tập, công việc và trải nghiệm cá nhân."
        },
        "can": [
          {
            "vi": "Kể lại một trải nghiệm theo trình tự"
          },
          {
            "vi": "Hiểu ý chính hội thoại tốc độ chậm"
          },
          {
            "vi": "Đọc truyện phân cấp mà ít phải tra từ"
          },
          {
            "vi": "Viết đoạn văn 80–100 chữ"
          }
        ],
        "units": [
          {
            "vi": "Học tập & trường lớp"
          },
          {
            "vi": "Công việc"
          },
          {
            "vi": "Sức khỏe & thể thao"
          },
          {
            "vi": "Kể lại trải nghiệm"
          },
          {
            "vi": "Thành phố & nơi ở"
          }
        ],
        "methods": [
          {
            "vi": "Đọc mở rộng"
          },
          {
            "vi": "Nhật ký ngắn"
          },
          {
            "vi": "Shadowing hội thoại"
          }
        ],
        "skills": [
          {
            "vi": "Nghe"
          },
          {
            "vi": "Nói"
          },
          {
            "vi": "Đọc"
          },
          {
            "vi": "Viết"
          }
        ],
        "provenance": {
          "source": {
            "file": "mockup/hsk-roadmap.js",
            "declaration": "bands",
            "line": 6,
            "item": 3
          },
          "license": "LicenseRef-SoloLanguages-Proprietary",
          "attribution": "© SoloLanguages. All rights reserved.",
          "version": "bc95722",
          "retrievedAt": "2026-11-02T08:40:09.589Z"
        }
      },
      "zh:onboarding-band": {
        "id": "zh:onboarding-band:hsk3",
        "categories": {
          "vi": "SƠ CẤP"
        },
        "descriptions": {
          "vi": "Kể lại trải nghiệm, đọc đoạn văn ngắn."
        },
        "provenance": {
          "source": {
            "file": "mockup/onboarding-course.js",
            "declaration": "bands",
            "line": 5,
            "item": 3
          },
          "license": "LicenseRef-SoloLanguages-Proprietary",
          "attribution": "© SoloLanguages. All rights reserved.",
          "version": "bc95722",
          "retrievedAt": "2026-11-02T08:40:09.589Z"
        }
      }
    },
    "provenance": {
      "source": {
        "file": "mockup/language.js",
        "declaration": "hskNames",
        "line": 45,
        "item": 3
      },
      "license": "LicenseRef-SoloLanguages-Proprietary",
      "attribution": "© SoloLanguages. All rights reserved.",
      "version": "bc95722",
      "retrievedAt": "2026-11-02T08:40:09.589Z"
    }
  },
  {
    "id": "zh:stage:hsk4",
    "courseCode": "hsk",
    "order": 4,
    "frameworkCode": "hsk-3.0",
    "levelCode": "HSK4",
    "labels": {
      "vi": "HSK 4"
    },
    "extensions": {
      "zh:roadmap-band": {
        "id": "zh:roadmap-band:hsk4",
        "short": "4",
        "groupId": "zh:roadmap-group:intermediate",
        "hours": 180,
        "counts": {
          "syllables": 724,
          "characters": 1200,
          "words": 3245,
          "grammarPoints": 286,
          "handwrittenCharacters": 400,
          "verified": false
        },
        "goals": {
          "vi": "Trình bày và bảo vệ quan điểm về chủ đề quen thuộc."
        },
        "can": [
          {
            "vi": "Nêu quan điểm và đưa lý do"
          },
          {
            "vi": "Nghe hiểu podcast tốc độ chậm"
          },
          {
            "vi": "Đọc bài viết phổ thông ngắn"
          },
          {
            "vi": "Dịch câu đơn Việt ⇄ Trung"
          }
        ],
        "units": [
          {
            "vi": "Quan điểm cá nhân"
          },
          {
            "vi": "Văn hóa & phong tục"
          },
          {
            "vi": "Công nghệ trong đời sống"
          },
          {
            "vi": "Mạng xã hội"
          },
          {
            "vi": "Tranh luận đơn giản"
          }
        ],
        "methods": [
          {
            "vi": "Học từ trong câu thật"
          },
          {
            "vi": "Podcast tốc độ chậm"
          },
          {
            "vi": "Dịch câu"
          }
        ],
        "skills": [
          {
            "vi": "Nghe"
          },
          {
            "vi": "Nói"
          },
          {
            "vi": "Đọc"
          },
          {
            "vi": "Viết"
          },
          {
            "vi": "Dịch"
          }
        ],
        "provenance": {
          "source": {
            "file": "mockup/hsk-roadmap.js",
            "declaration": "bands",
            "line": 6,
            "item": 4
          },
          "license": "LicenseRef-SoloLanguages-Proprietary",
          "attribution": "© SoloLanguages. All rights reserved.",
          "version": "bc95722",
          "retrievedAt": "2026-11-02T08:40:09.589Z"
        }
      },
      "zh:onboarding-band": {
        "id": "zh:onboarding-band:hsk4",
        "categories": {
          "vi": "TRUNG CẤP"
        },
        "descriptions": {
          "vi": "Nêu quan điểm về chủ đề quen thuộc."
        },
        "provenance": {
          "source": {
            "file": "mockup/onboarding-course.js",
            "declaration": "bands",
            "line": 5,
            "item": 4
          },
          "license": "LicenseRef-SoloLanguages-Proprietary",
          "attribution": "© SoloLanguages. All rights reserved.",
          "version": "bc95722",
          "retrievedAt": "2026-11-02T08:40:09.589Z"
        }
      }
    },
    "provenance": {
      "source": {
        "file": "mockup/language.js",
        "declaration": "hskNames",
        "line": 45,
        "item": 4
      },
      "license": "LicenseRef-SoloLanguages-Proprietary",
      "attribution": "© SoloLanguages. All rights reserved.",
      "version": "bc95722",
      "retrievedAt": "2026-11-02T08:40:09.589Z"
    }
  },
  {
    "id": "zh:stage:hsk5",
    "courseCode": "hsk",
    "order": 5,
    "frameworkCode": "hsk-3.0",
    "levelCode": "HSK5",
    "labels": {
      "vi": "HSK 5"
    },
    "extensions": {
      "zh:roadmap-band": {
        "id": "zh:roadmap-band:hsk5",
        "short": "5",
        "groupId": "zh:roadmap-group:intermediate",
        "hours": 250,
        "counts": {
          "syllables": 822,
          "characters": 1500,
          "words": 4316,
          "grammarPoints": 357,
          "handwrittenCharacters": 500,
          "verified": false
        },
        "goals": {
          "vi": "Hiểu tin tức, bài báo và thảo luận chủ đề xã hội."
        },
        "can": [
          {
            "vi": "Đọc hiểu bài báo phổ thông"
          },
          {
            "vi": "Tóm tắt nội dung đã nghe hoặc đọc"
          },
          {
            "vi": "Viết bài ngắn có mở bài, thân bài, kết luận"
          },
          {
            "vi": "Dịch đoạn văn ngắn"
          }
        ],
        "units": [
          {
            "vi": "Tin tức & thời sự"
          },
          {
            "vi": "Kinh tế đời thường"
          },
          {
            "vi": "Giáo dục"
          },
          {
            "vi": "Môi trường"
          },
          {
            "vi": "Đọc báo & tóm tắt"
          }
        ],
        "methods": [
          {
            "vi": "Đọc báo có chú giải"
          },
          {
            "vi": "Tóm tắt bằng lời"
          },
          {
            "vi": "Viết theo dàn ý"
          }
        ],
        "skills": [
          {
            "vi": "Nghe"
          },
          {
            "vi": "Nói"
          },
          {
            "vi": "Đọc"
          },
          {
            "vi": "Viết"
          },
          {
            "vi": "Dịch"
          }
        ],
        "provenance": {
          "source": {
            "file": "mockup/hsk-roadmap.js",
            "declaration": "bands",
            "line": 6,
            "item": 5
          },
          "license": "LicenseRef-SoloLanguages-Proprietary",
          "attribution": "© SoloLanguages. All rights reserved.",
          "version": "bc95722",
          "retrievedAt": "2026-11-02T08:40:09.589Z"
        }
      },
      "zh:onboarding-band": {
        "id": "zh:onboarding-band:hsk5",
        "categories": {
          "vi": "TRUNG CẤP"
        },
        "descriptions": {
          "vi": "Đọc báo, nghe tin tức phổ thông."
        },
        "provenance": {
          "source": {
            "file": "mockup/onboarding-course.js",
            "declaration": "bands",
            "line": 5,
            "item": 5
          },
          "license": "LicenseRef-SoloLanguages-Proprietary",
          "attribution": "© SoloLanguages. All rights reserved.",
          "version": "bc95722",
          "retrievedAt": "2026-11-02T08:40:09.589Z"
        }
      }
    },
    "provenance": {
      "source": {
        "file": "mockup/language.js",
        "declaration": "hskNames",
        "line": 45,
        "item": 5
      },
      "license": "LicenseRef-SoloLanguages-Proprietary",
      "attribution": "© SoloLanguages. All rights reserved.",
      "version": "bc95722",
      "retrievedAt": "2026-11-02T08:40:09.589Z"
    }
  },
  {
    "id": "zh:stage:hsk6",
    "courseCode": "hsk",
    "order": 6,
    "frameworkCode": "hsk-3.0",
    "levelCode": "HSK6",
    "labels": {
      "vi": "HSK 6"
    },
    "extensions": {
      "zh:roadmap-band": {
        "id": "zh:roadmap-band:hsk6",
        "short": "6",
        "groupId": "zh:roadmap-group:intermediate",
        "hours": 300,
        "counts": {
          "syllables": 908,
          "characters": 1800,
          "words": 5456,
          "grammarPoints": 424,
          "handwrittenCharacters": 600,
          "verified": false
        },
        "goals": {
          "vi": "Diễn đạt trôi chảy, dùng được thành ngữ và nhiều văn phong."
        },
        "can": [
          {
            "vi": "Thảo luận chủ đề trừu tượng"
          },
          {
            "vi": "Hiểu chương trình truyền hình phổ thông"
          },
          {
            "vi": "Dùng thành ngữ (成语) thông dụng đúng ngữ cảnh"
          },
          {
            "vi": "Viết luận có lập luận rõ"
          }
        ],
        "units": [
          {
            "vi": "Xã hội & nghề nghiệp"
          },
          {
            "vi": "Lịch sử & văn hóa"
          },
          {
            "vi": "Khoa học phổ thông"
          },
          {
            "vi": "Thành ngữ 成语"
          },
          {
            "vi": "Viết luận"
          }
        ],
        "methods": [
          {
            "vi": "Tài liệu thật có phụ đề"
          },
          {
            "vi": "Học thành ngữ qua câu chuyện"
          },
          {
            "vi": "Viết luận có chữa lỗi"
          }
        ],
        "skills": [
          {
            "vi": "Nghe"
          },
          {
            "vi": "Nói"
          },
          {
            "vi": "Đọc"
          },
          {
            "vi": "Viết"
          },
          {
            "vi": "Dịch"
          }
        ],
        "provenance": {
          "source": {
            "file": "mockup/hsk-roadmap.js",
            "declaration": "bands",
            "line": 6,
            "item": 6
          },
          "license": "LicenseRef-SoloLanguages-Proprietary",
          "attribution": "© SoloLanguages. All rights reserved.",
          "version": "bc95722",
          "retrievedAt": "2026-11-02T08:40:09.589Z"
        }
      },
      "zh:onboarding-band": {
        "id": "zh:onboarding-band:hsk6",
        "categories": {
          "vi": "TRUNG CẤP"
        },
        "descriptions": {
          "vi": "Diễn đạt trôi chảy, dùng thành ngữ thông dụng."
        },
        "provenance": {
          "source": {
            "file": "mockup/onboarding-course.js",
            "declaration": "bands",
            "line": 5,
            "item": 6
          },
          "license": "LicenseRef-SoloLanguages-Proprietary",
          "attribution": "© SoloLanguages. All rights reserved.",
          "version": "bc95722",
          "retrievedAt": "2026-11-02T08:40:09.589Z"
        }
      }
    },
    "provenance": {
      "source": {
        "file": "mockup/language.js",
        "declaration": "hskNames",
        "line": 45,
        "item": 6
      },
      "license": "LicenseRef-SoloLanguages-Proprietary",
      "attribution": "© SoloLanguages. All rights reserved.",
      "version": "bc95722",
      "retrievedAt": "2026-11-02T08:40:09.589Z"
    }
  },
  {
    "id": "zh:stage:hsk7-9",
    "courseCode": "hsk",
    "order": 7,
    "frameworkCode": "hsk-3.0",
    "levelCode": "HSK7-9",
    "labels": {
      "vi": "HSK 7–9"
    },
    "extensions": {
      "zh:roadmap-band": {
        "id": "zh:roadmap-band:hsk7-9",
        "short": "7–9",
        "groupId": "zh:roadmap-group:advanced",
        "hours": 600,
        "counts": {
          "syllables": 1110,
          "characters": 3000,
          "words": 11092,
          "grammarPoints": 572,
          "handwrittenCharacters": 1200,
          "verified": false
        },
        "goals": {
          "vi": "Dùng tiếng Trung cho học thuật, công việc chuyên môn và dịch."
        },
        "can": [
          {
            "vi": "Đọc văn bản học thuật và trang trọng"
          },
          {
            "vi": "Thuyết trình, tranh luận chuyên đề"
          },
          {
            "vi": "Dịch Việt ⇄ Trung đoạn văn chuyên ngành"
          },
          {
            "vi": "Viết báo cáo, bài luận dài"
          }
        ],
        "units": [
          {
            "vi": "Học thuật & chuyên ngành"
          },
          {
            "vi": "Văn bản trang trọng"
          },
          {
            "vi": "Dịch Việt ⇄ Trung"
          },
          {
            "vi": "Thuyết trình & tranh luận"
          },
          {
            "vi": "Văn học & thành ngữ nâng cao"
          }
        ],
        "methods": [
          {
            "vi": "Tài liệu gốc"
          },
          {
            "vi": "Dịch đối chiếu"
          },
          {
            "vi": "Thuyết trình có phản hồi"
          }
        ],
        "skills": [
          {
            "vi": "Nghe"
          },
          {
            "vi": "Nói"
          },
          {
            "vi": "Đọc"
          },
          {
            "vi": "Viết"
          },
          {
            "vi": "Dịch"
          }
        ],
        "provenance": {
          "source": {
            "file": "mockup/hsk-roadmap.js",
            "declaration": "bands",
            "line": 6,
            "item": 7
          },
          "license": "LicenseRef-SoloLanguages-Proprietary",
          "attribution": "© SoloLanguages. All rights reserved.",
          "version": "bc95722",
          "retrievedAt": "2026-11-02T08:40:09.589Z"
        }
      },
      "zh:onboarding-band": {
        "id": "zh:onboarding-band:hsk7-9",
        "categories": {
          "vi": "CAO CẤP"
        },
        "descriptions": {
          "vi": "Dùng tiếng Trung cho học thuật, công việc và dịch."
        },
        "provenance": {
          "source": {
            "file": "mockup/onboarding-course.js",
            "declaration": "bands",
            "line": 5,
            "item": 7
          },
          "license": "LicenseRef-SoloLanguages-Proprietary",
          "attribution": "© SoloLanguages. All rights reserved.",
          "version": "bc95722",
          "retrievedAt": "2026-11-02T08:40:09.589Z"
        }
      }
    },
    "provenance": {
      "source": {
        "file": "mockup/language.js",
        "declaration": "hskNames",
        "line": 45,
        "item": 7
      },
      "license": "LicenseRef-SoloLanguages-Proprietary",
      "attribution": "© SoloLanguages. All rights reserved.",
      "version": "bc95722",
      "retrievedAt": "2026-11-02T08:40:09.589Z"
    }
  }
] satisfies Stage[];

export default data;
