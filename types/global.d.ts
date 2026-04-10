import { MongoClient } from "mongodb";
declare global {
  var _mongoClientPromiseQotd: Promise<MongoClient> | undefined;
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export {};
