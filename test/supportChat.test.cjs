const test = require("node:test");
const assert = require("node:assert/strict");
const ts = require("typescript");
const fs = require("node:fs");
const previous = require.extensions[".ts"];
require.extensions[".ts"] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, file);
const { chatCopy, chatGuideHref, chatLanguages, chatTopics, searchChatQuestions } = require("../lib/supportChat.ts");
if (previous) require.extensions[".ts"] = previous; else delete require.extensions[".ts"];

test("every guided chat branch has a translated question and answer in all six languages", () => {
  assert.equal(chatLanguages.length, 6);
  const indices = chatTopics.flatMap(topic => topic.questions);
  assert.equal(new Set(indices).size, 14);
  for (const { id } of chatLanguages) {
    const copy = chatCopy[id];
    assert.equal(copy.questions.length, 14); assert.equal(copy.answers.length, 14);
    assert.ok(copy.greeting && copy.privacy && copy.team && copy.intro);
    for (const topic of chatTopics) assert.ok(copy.topics[topic.id]);
    for (const index of indices) { assert.ok(copy.questions[index].trim()); assert.ok(copy.answers[index].length > 40); }
  }
  assert.match(chatCopy.hi.greeting, /नमस्ते/); assert.match(chatCopy.bn.greeting, /স্বাগতম/);
});
test("chat resources are fixed website paths and search cannot create a URL or a fabricated answer", () => {
  for (let i = 0; i < 14; i++) assert.match(chatGuideHref(i), /^\/(?!\/)/);
  assert.equal(chatGuideHref(9999), "/help-centre");
  assert.ok(searchChatQuestions("en", "withdrawal").includes(6));
  assert.ok(searchChatQuestions("hi", "निकासी").includes(7));
  assert.deepEqual(searchChatQuestions("en", "my private OTP 123456 password"), []);
  assert.deepEqual(searchChatQuestions("en", "https://outside.invalid/?token=private"), []);
  assert.deepEqual(searchChatQuestions("en", "   "), []);
});
test("the public guide keeps eligibility restrictions, qualified timings and secure support boundaries", () => {
  assert.match(chatCopy.en.answers[3], /UAE nationality, UAE residence or UAE-issued/);
  assert.match(chatCopy.en.answers[6], /1–4 hours/); assert.match(chatCopy.en.answers[6], /not a guaranteed/);
  assert.match(chatCopy.en.answers[12], /does not create a ticket or connect a live agent/);
  assert.match(chatCopy.en.answers[13], /no access to account records/);
});
