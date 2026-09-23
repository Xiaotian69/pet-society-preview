export const symptoms = [
  {
    id: "vomiting",
    name: "呕吐",
    description: "吐了、干呕，或吃完又吐出来",
    icon: "wave",
  },
  {
    id: "diarrhea",
    name: "腹泻",
    description: "便便变稀、次数比平时多",
    icon: "drop",
  },
  {
    id: "constipation",
    name: "便秘",
    description: "排便费力，或比平时少",
    icon: "leaf",
  },
];
export const questions = [
  {
    title: "你是什么时候开始注意到的？",
    note: "回想第一次观察到变化的时间。",
    options: ["今天", "1–3 天前", "超过 3 天", "不清楚"],
  },
  {
    title: "和往常相比，它的精神怎么样？",
    note: "选择最接近你观察到的情况。",
    options: ["和平时一样", "比平时安静", "变化比较明显", "不清楚"],
  },
  {
    title: "最近的食欲有变化吗？",
    note: "最后整理一下它最近吃东西的情况。",
    options: ["和平时一样", "吃得少了", "暂时不想吃", "不清楚"],
  },
];
export function validatePet(pet = {}) {
  if (!pet || typeof pet !== "object" || Array.isArray(pet))
    return ["name", "species", "breed", "age", "sex", "weight"];
  const invalid = ["name", "breed", "age", "weight"].filter(
    (key) =>
      typeof pet[key] !== "string" || !pet[key].trim() || pet[key].length > 100,
  );
  if (!["dog", "cat"].includes(pet.species)) invalid.push("species");
  if (!["male", "female", "unknown"].includes(pet.sex)) invalid.push("sex");
  if (
    typeof pet.weight === "string" &&
    pet.weight &&
    pet.weight !== "不清楚" &&
    (!Number.isFinite(Number(pet.weight)) || Number(pet.weight) <= 0)
  )
    invalid.push("weight");
  return [...new Set(invalid)];
}
export function createRecord(pet, symptomId, answers) {
  if (
    validatePet(pet).length ||
    !symptoms.some((s) => s.id === symptomId) ||
    answers.length !== questions.length ||
    answers.some((a, i) => !questions[i].options.includes(a))
  )
    throw Error("请先完成资料和观察记录。");
  return {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    demo: true,
    pet: structuredClone(pet),
    symptomId,
    answers: questions.map((q, i) => ({
      question: q.title,
      value: answers[i],
    })),
  };
}
export function saveRecord(history, record) {
  return [record, ...history.filter((r) => r.id !== record.id)].slice(0, 50);
}
export function createStore(storage) {
  const memory = new Map();
  let persistent = Boolean(storage);
  return {
    get persistent() {
      return persistent;
    },
    read(key, fallback) {
      if (memory.has(key)) return memory.get(key);
      try {
        const raw = storage?.getItem("pet-society-demo-v1:" + key);
        return raw ? JSON.parse(raw) : fallback;
      } catch {
        return fallback;
      }
    },
    write(key, value) {
      memory.set(key, value);
      try {
        if (!storage) throw Error();
        storage.setItem("pet-society-demo-v1:" + key, JSON.stringify(value));
      } catch {
        persistent = false;
      }
    },
  };
}
