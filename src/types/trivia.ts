export type Category =
    | "宇宙"
    | "動物"
    | "歴史"
    | "科学"
    | "日常"
    | "人体"
    | "IT・テクノロジー";

export interface Trivia {
    id: string;
    category: Category;
    content: string;
    emoji: string;
}
