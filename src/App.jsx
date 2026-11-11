import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  // どのタブを表示しているか（"register" = 登録, "list" = 一覧, "mypage" = マイページ）
  const [currentTab, setCurrentTab] = useState("register");

  // データや入力値の状態管理
  const [reservations, setReservations] = useState([]);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [searchName, setSearchName] = useState("");
  const [myReservations, setMyReservations] = useState([]);

  // 1. バックエンドから予約一覧を読み込む関数
  const fetchReservations = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/reservations");
      if (response.ok) {
        const data = await response.json();
        setReservations(data);
      }
    } catch (err) {
      console.log("バックエンドとの通信エラー:", err);
    }
  };

  // 初回ロード時に一覧を取得
  useEffect(() => {
    fetchReservations();
  }, []);

  // 2. 予約を登録する処理
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !date) {
      alert("お名前と日付を入力してください！");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, date, status: "予約確定" }),
      });

      if (response.ok) {
        alert("予約が完了しました！");
        setName("");
        setDate("");
        fetchReservations(); // 一覧を再取得
        setCurrentTab("list"); // 登録できたら自動で一覧画面へ移動
      } else {
        alert("登録に失敗しました。");
      }
    } catch (err) {
      console.error("通信エラー:", err);
    }
  };

  // 3. マイページで名前検索する処理
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchName) {
      setMyReservations([]);
      return;
    }
    const filtered = reservations.filter((item) =>
      item.name.includes(searchName),
    );
    setMyReservations(filtered);
  };

  return (
    <div
      style={{
        fontFamily: "sans-serif",
        maxWidth: "600px",
        margin: "40px auto",
        padding: "20px",
      }}
    >
      <h1 style={{ textAlign: "center" }}>📅 予約管理システム</h1>

      {/* タブの切り替えボタン */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "10px",
          marginBottom: "30px",
        }}
      >
        <button
          onClick={() => setCurrentTab("register")}
          style={{
            padding: "10px 20px",
            backgroundColor: currentTab === "register" ? "#007BFF" : "#ccc",
            color: "white",
            border: "none",
            cursor: "pointer",
            borderRadius: "5px",
          }}
        >
          新規予約
        </button>
        <button
          onClick={() => {
            setCurrentTab("list");
            fetchReservations();
          }}
          style={{
            padding: "10px 20px",
            backgroundColor: currentTab === "list" ? "#007BFF" : "#ccc",
            color: "white",
            border: "none",
            cursor: "pointer",
            borderRadius: "5px",
          }}
        >
          予約一覧
        </button>
        <button
          onClick={() => setCurrentTab("mypage")}
          style={{
            padding: "10px 20px",
            backgroundColor: currentTab === "mypage" ? "#007BFF" : "#ccc",
            color: "white",
            border: "none",
            cursor: "pointer",
            borderRadius: "5px",
          }}
        >
          マイページ
        </button>
      </div>

      {/* ① 新規予約画面 */}
      {currentTab === "register" && (
        <div
          style={{
            background: "#f9f9f9",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h2>新規予約の登録</h2>
          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>
                お名前：
              </label>
              <input
                type="text"
                placeholder="例：山田 太郎"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>
                予約日：
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "10px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                cursor: "pointer",
                borderRadius: "4px",
                fontSize: "16px",
              }}
            >
              予約を登録する
            </button>
          </form>
        </div>
      )}

      {/* ② 予約一覧画面 */}
      {currentTab === "list" && (
        <div
          style={{
            background: "#f9f9f9",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h2>📋 予約一覧</h2>
          {reservations.length === 0 ? (
            <p>まだ予約はありません。</p>
          ) : (
            <table
              border="1"
              cellPadding="10"
              style={{
                borderCollapse: "collapse",
                width: "100%",
                marginTop: "10px",
                background: "white",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#eee" }}>
                  <th>ID</th>
                  <th>お名前</th>
                  <th>予約日</th>
                  <th>ステータス</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    <td>{item.date}</td>
                    <td>{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ③ マイページ画面 */}
      {currentTab === "mypage" && (
        <div
          style={{
            background: "#f9f9f9",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h2>👤 マイページ（予約確認）</h2>
          <form
            onSubmit={handleSearch}
            style={{ display: "flex", gap: "10px", marginBottom: "20px" }}
          >
            <input
              type="text"
              placeholder="ご登録のお名前を入力..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              style={{ flex: 1, padding: "8px" }}
            />
            <button
              type="submit"
              style={{
                padding: "8px 16px",
                backgroundColor: "#007BFF",
                color: "white",
                border: "none",
                cursor: "pointer",
                borderRadius: "4px",
              }}
            >
              検索
            </button>
          </form>

          <h3>検索結果</h3>
          {myReservations.length > 0 ? (
            <ul style={{ paddingLeft: "20px" }}>
              {myReservations.map((item) => (
                <li key={item.id} style={{ marginBottom: "8px" }}>
                  {item.date} - <strong>{item.name}</strong> ({item.status})
                </li>
              ))}
            </ul>
          ) : (
            <p>該当する予約が見つからないか、検索されていません。</p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
