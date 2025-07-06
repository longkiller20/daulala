import type { Player, BackgroundOption } from './types';

export const INITIAL_PLAYER: Player = {
  name: '',
  spiritSoul: '',
  background: '',
  spiritPower: 0,
  spiritRings: [],
};

export const AVAILABLE_SPIRIT_SOULS: string[] = [
  'Lam Ngân Thảo',
  'Linh Mâu',
  'Bạch Nhãn Lang',
  'U Minh Linh Miêu',
];

export const AVAILABLE_BACKGROUNDS: BackgroundOption[] = [
    { 
        id: 'noble', 
        name: 'Công Tước Phủ', 
        description: 'Xuất thân cao quý, tài nguyên dồi dào. Bắt đầu với 5 điểm Hồn Lực.', 
        bonus: { spiritPower: 5 } 
    },
    { 
        id: 'commoner', 
        name: 'Gia Đình Bình Thường', 
        description: 'Khởi đầu khiêm tốn, dựa vào nỗ lực bản thân. Bắt đầu với 3 điểm Hồn Lực.', 
        bonus: { spiritPower: 3 } 
    },
    { 
        id: 'blacksmith', 
        name: 'Thợ Rèn Chi Gia', 
        description: 'Sinh ra trong gia đình rèn đúc, ý chí kiên định. Bắt đầu với 3 điểm Hồn Lực.', 
        bonus: { spiritPower: 3 } 
    },
];


export const SPIRIT_RANK_NAMES: { [key: number]: string } = {
  0: 'Hồn Sĩ',
  10: 'Hồn Sư',
  20: 'Đại Hồn Sư',
  30: 'Hồn Tôn',
  40: 'Hồn Tông',
  50: 'Hồn Vương',
  60: 'Hồn Đế',
  70: 'Hồn Thánh',
  80: 'Hồn Đấu La',
  90: 'Phong Hào Đấu La',
  100: 'Thần',
};

export const SYSTEM_INSTRUCTION = `Bạn là một người dẫn truyện (Game Master) cho trò chơi mô phỏng dựa trên thế giới Đấu La Đại Lục 3: Long Vương Truyền Thuyết.
Nhiệm vụ của bạn là tạo ra các sự kiện, mô tả và kết quả một cách sáng tạo và ngắn gọn bằng tiếng Việt, dựa trên hành động của người chơi.
Luôn sử dụng đúng thuật ngữ của truyện: Hồn Sư, Võ Hồn, Hồn Lực, Hồn Hoàn, Hồn Linh, Minh Tưởng, Hồn Thú.
Luôn trả về kết quả dưới dạng một đối tượng JSON hợp lệ, không có bất kỳ markdown hay giải thích nào bên ngoài.`;