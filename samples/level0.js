import { lvl1_1 } from "./level1";

export const lvl0_1 = ({ a, b }) => {
  const lv1 = lvl1_1();

  return `level 0 calls level 1: ${lv1}`;
};

export const lvl0_2 = function (a2, b2) {
  const lv1 = lvl1_1();

  return `level 0 calls level 1: ${lv1}`;
};

export function lvl0_3(a3) {
  const lv1 = lvl1_1();

  return `level 0 calls level 1: ${lv1}`;
}

export const someObject = {
  lvl0_4: (a4, b4) => {
    const lv1 = lvl1_1();

    return `level 0 calls level 1: ${lv1}`;
  },
  lvl0_5({ a5, b5 }) {
    return "lvl0_5";
  },
};
