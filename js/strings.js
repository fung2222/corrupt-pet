/** Bilingual flavor + UI labels for CORRUPT.PET MVP */
export const STR = {
  zh: {
    meters: { hunger: '飢餓', stability: '穩定', heat: '熱', loyalty: '忠誠', glitch: '毛刺' },
    forms: {
      CHIP_EGG: '罪晶蛋',
      LARVA: '腐蝕幼體',
      CORPORATE_DRONE: '企業傀儡',
      STREET_VIRUS: '街頭病毒',
      MELT: '熔毀晶渣',
    },
    eggPrompt: '罪晶在跳。輕觸孵化。',
    hatched: '殼裂了。它看著你，像在記仇。',
    feed: [
      '合成漿灌進去。嘴管亮了一下。',
      '過飽。熱在爬。',
      '它吞了。沒有謝謝你。',
    ],
    neglect: [
      '你離開了。它沒有。',
      '飢餓長毛刺。忠誠在掉渣。',
      '無人照料協議啟動。',
    ],
    inject: [
      '非法晶片液入靜脈。洋紅爬上來。',
      '穩定崩潰中。很好。',
      '針孔還在笑。',
    ],
    jackOk: [
      '連線成功。企業心跳同步。',
      '它記住了你的節奏。有點太聽話。',
    ],
    jackFail: [
      '插線失敗。毛刺噴出來。',
      '訊號反噬。它恨這次握手。',
    ],
    punish: [
      '電刺。忠誠極端化。',
      '項圈收緊。服從或仇恨——二選一。',
      '懲罰寫進固件。',
    ],
    forkDrone: '分叉鎖定：企業傀儡。方肩、條碼臉、數據線領帶。',
    forkVirus: '分叉鎖定：街頭病毒。破碎多邊形，多嘴噴碼。',
    melt: '熱與飢餓雙爆。焦黑晶渣。',
    meltCopy: '焦黑晶渣。還要再養一隻更壞的嗎？',
    jackTitle: '插線 JACK-IN',
    jackCopy: '針走進亮區時按下鎖定。',
    lock: '鎖定 LOCK',
    cancel: '中止',
    rehatch: '重孵 RE-HATCH',
    simmer: (h, heat) => `離線慢煮：飢餓 +${h} · 熱 ${heat >= 0 ? '+' : ''}${heat}`,
    hostLaugh: '你的寄體在笑。不是對你。',
    corpFirmware: (n) => `企業固件已覆蓋 ${n}%。還要餵嗎？`,
    hint: 'MVP · 短局照料 · 長期腐化',
  },
  en: {
    meters: { hunger: 'HUNGER', stability: 'STABLE', heat: 'HEAT', loyalty: 'LOYAL', glitch: 'GLITCH' },
    forms: {
      CHIP_EGG: 'CHIP_EGG',
      LARVA: 'LARVA',
      CORPORATE_DRONE: 'CORPORATE DRONE',
      STREET_VIRUS: 'STREET VIRUS',
      MELT: 'MELT SLAG',
    },
    eggPrompt: 'The sin-chip twitches. Tap to hatch.',
    hatched: 'Shell cracked. It looks at you like it is filing a grudge.',
    feed: [
      'Synth slurry goes down. Mouth-tubes flare.',
      'Overfed. Heat climbs.',
      'It swallows. No thanks.',
    ],
    neglect: [
      'You left. It did not.',
      'Hunger grows glitch. Loyalty flakes off.',
      'Unattended protocol online.',
    ],
    inject: [
      'Illegal chip-fluid in the veins. Magenta crawls.',
      'Stability collapsing. Good.',
      'The needle-hole is still smiling.',
    ],
    jackOk: [
      'Jack-in clean. Corporate heartbeat synced.',
      'It learned your rhythm. Too obedient.',
    ],
    jackFail: [
      'Jack-in failed. Glitch sprays out.',
      'Signal bite-back. It hates this handshake.',
    ],
    punish: [
      'Shock. Loyalty polarizes.',
      'Collar tightens. Obey or hate — pick one.',
      'Punishment written into firmware.',
    ],
    forkDrone: 'Fork locked: Corporate Drone. Box shoulders, barcode face, data-tie.',
    forkVirus: 'Fork locked: Street Virus. Broken polygons, multi-mouth spray.',
    melt: 'Heat + hunger double-crit. Black slag.',
    meltCopy: 'Black slag. Hatch another worse one?',
    jackTitle: 'JACK-IN',
    jackCopy: 'Press LOCK when the needle is in the bright zone.',
    lock: 'LOCK',
    cancel: 'ABORT',
    rehatch: 'RE-HATCH',
    simmer: (h, heat) => `Offline simmer: hunger +${h} · heat ${heat >= 0 ? '+' : ''}${heat}`,
    hostLaugh: 'Your host is smiling. Not at you.',
    corpFirmware: (n) => `Corporate firmware coverage ${n}%. Feed again?`,
    hint: 'MVP · short care · long corruption',
  },
};

export function pick(arr) {
  return arr[(Math.random() * arr.length) | 0];
}
