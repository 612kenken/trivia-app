export type Category =
    | "宇宙"
    | "動物"
    | "人体"
    | "歴史"
    | "IT・テクノロジー"
    | "科学"
    | "日常"
    | "スポンサー";

export interface Trivia {
    id: string;
    category: Category;
    content: string;
    emoji: string;
}
