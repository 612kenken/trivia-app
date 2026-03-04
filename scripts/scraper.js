const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = path.join(__dirname, '../src/data/scraped_trivia.json');

const getCategory = (text) => {
    if (text.match(/宇宙|星|月|太陽|地球|ブラックホール/)) return '宇宙';
    if (text.match(/動物|犬|猫|鳥|魚|昆虫|生息|熊|サメ|キリン/)) return '動物';
    if (text.match(/人間|体|骨|目|鼻|脳|髪|血|身長|筋肉/)) return '人体';
    if (text.match(/歴史|昔|古代|時代|年|世紀|建国|制定|江戸|戦国/)) return '歴史';
    if (text.match(/パソコン|ネット|IT|AI|スマホ|プログラミング/)) return 'IT・テクノロジー';
    if (text.match(/科学|物質|水|氷|光|音|発見|化学|物理/)) return '科学';
    return '日常';
};

const getEmoji = (category) => {
    const map = {
        '宇宙': '🪐',
        '動物': '🐾',
        '人体': '🦴',
        '歴史': '🏺',
        'IT・テクノロジー': '💻',
        '科学': '🔬',
        '日常': '☕'
    };
    return map[category] || '💡';
};

const scrapeTrivias = async () => {
    console.log('スクレイピングを開始します（複数ソース版）...');
    let results = [];

    try {
        // ---- 1. Wikipedia「今日は何の日」から歴史雑学 ----
        console.log('[1/2] Wikipedia: 3月5日の出来事を取得中...');
        const res1 = await fetch('https://ja.wikipedia.org/wiki/3%E6%9C%885%E6%97%A5');
        const html1 = await res1.text();

        const liRegex = /<li>(.*?)<\/li>/g;
        let match;
        let count1 = 0;
        while ((match = liRegex.exec(html1)) !== null) {
            if (count1 >= 25) break;

            let text = match[1].replace(/<[^>]*>?/gm, '').trim();
            text = text.replace(/\[\d+\]/g, '');

            if (text.includes(' - ') && text.length > 20 && text.length < 150) {
                const parts = text.split(' - ');
                const content = `${parts[0].trim()}のこの日、${parts.slice(1).join(' - ').trim()}。`;
                const category = getCategory(content);

                results.push({ id: `s-${results.length + 1}`, category, content, emoji: getEmoji(category) });
                count1++;
            }
        }

        // ---- 2. Wikipedia「生物に関する記事」等の代表例から「動物・科学」系の雑学（ダミーテキスト風抽出） ----
        // ※今回は実在の「へぇ」となる動物豆知識を直接追加するデモAPIを想定し、Wikipedia「イヌ」や「ネコ」等から抜粋する擬似スクレイピングを行います。
        // （完全自動だと文脈がおかしくなるため、ある程度のWikiテキストの概要文を抽出）
        console.log('[2/2] Wikipedia: 代表的な動物記事から取得中...');

        const animalsToScrape = ['ネコ', 'イヌ', 'パンダ', 'イルカ', 'キリン'];
        for (const animal of animalsToScrape) {
            const resA = await fetch(`https://ja.wikipedia.org/wiki/${encodeURIComponent(animal)}`);
            const htmlA = await resA.text();

            // 最初の <p> タグ（概要文）を抽出
            const pMatch = htmlA.match(/<p>(.*?)<\/p>/g);
            if (pMatch && pMatch.length > 0) {
                // 先頭からいくつか見て、内容があるpタグを採用
                for (let p of pMatch.slice(0, 3)) {
                    let text = p.replace(/<[^>]*>?/gm, '').trim().replace(/\[\d+\]/g, '');
                    // 雑学っぽく1文（最初の。まで）を切り取る
                    let sentence = text.split('。')[0];
                    if (sentence.length > 20 && sentence.length < 100) {
                        const content = sentence + "。";
                        results.push({ id: `s-${results.length + 1}`, category: '動物', content, emoji: '🐾' });
                        break; // 1つの動物につき1面白知識
                    }
                }
            }
        }

        // ---- 3. 静的なボーナス雑学をごそっと追加（スクレイピングで足りない分を補完） ----
        const bonusTrivias = [
            "サメは実は虫歯にならない。歯の表面がフッ素100%でできているためである。",
            "白くま（ホッキョクグマ）の毛は白ではなく透明である。光の反射で白く見えている。",
            "キリンの睡眠時間は1日でわずか20分程度である。",
            "ミツバチは数字の「0（ゼロ）」の概念を理解できる数少ない生物である。",
            "人間は息を止めながらツバを飲み込むことはできない。",
            "「Wi-Fi」は何かの略称ではない。ただのブランド名として作られた造語である。",
            "ゴリラはストレスを感じやすく、ショックで下痢を起こすことがある。",
            "ウミガメは産卵の時に泣くと言われているが、あれは体内の余分な塩分を目から排出しているだけである。",
            "蚊に刺されやすいのはO型の人で、A型の人の約2倍刺されやすいという研究結果がある。",
            "フラミンゴが片足で立つ理由は、両足を水につけると体温が奪われてしまうのを防ぐためである。"
        ];

        for (const bt of bonusTrivias) {
            const cat = getCategory(bt);
            results.push({ id: `s-${results.length + 1}`, category: cat, content: bt, emoji: getEmoji(cat) });
        }

        console.log(`合計 ${results.length} 件の雑学を取得しました。`);

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2), 'utf-8');
        console.log(`データを保存しました: ${OUTPUT_FILE}`);

    } catch (error) {
        console.error('スクレイピング中にエラーが発生しました:', error);
    }
};

scrapeTrivias();
