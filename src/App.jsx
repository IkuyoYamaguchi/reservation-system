import React, { useState } from "react";
import "./App.css";

function App() {
  // 現在の画面 ('top' | 'mypage')
  const [currentPage, setCurrentPage] = useState("top");

  // 入力フォームの状態
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [tel, setTel] = useState("");
  const [date, setDate] = useState("");

  // マイページ用の状態
  const [reservations, setReservations] = useState([]);
  const [searchEmail, setSearchEmail] = useState("");

  // ポップアップ（予約完了モーダル）の制御用状態
  const [showModal, setShowModal] = useState(false);
  const [registeredData, setRegisteredData] = useState(null);
  const [message, setMessage] = useState("");

  // 予約登録処理（POST /api/reservations）
  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    const newReservation = { name, email, tel, date, status: "予約完了" };

    try {
      const response = await fetch("http://localhost:8080/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReservation),
      });

      if (response.status === 201) {
        const data = await response.json();
        setRegisteredData(data); // 登録されたデータを保持
        setShowModal(true); // ★ポップアップを表示する

        // 入力欄をクリア
        setName("");
        setEmail("");
        setTel("");
        setDate("");
      } else {
        setMessage("登録に失敗しました。入力内容を確認してください。");
      }
    } catch (error) {
      console.error("通信エラー:", error);
      setMessage("サーバーとの通信に失敗しました。");
    }
  };

  // キャンセル処理（PUTでステータスを「キャンセル」に更新）
  const handleCancel = async (id) => {
    if (!window.confirm("本当にこの予約をキャンセルしますか？")) return;

    try {
      const response = await fetch(
        `http://localhost:8080/api/reservations/${id}/cancel`,
        {
          method: "PUT",
        },
      );

      if (response.ok) {
        alert("予約をキャンセルしました。");
        handleSearchByEmail(searchEmail);
      } else {
        alert("指定された予約が見つかりませんでした。");
      }
    } catch (error) {
      console.error("キャンセルエラー:", error);
    }
  };

  // メールアドレスで自分の予約を検索する関数
  const handleSearchByEmail = async (targetEmail) => {
    if (!targetEmail) {
      setReservations([]);
      return;
    }

    try {
      const url = `http://localhost:8080/api/reservations?email=${encodeURIComponent(targetEmail)}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setReservations(data);
      }
    } catch (error) {
      console.error("データ取得エラー:", error);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearchByEmail(searchEmail);
  };

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "sans-serif",
        maxWidth: "600px",
        margin: "0 auto",
        position: "relative",
      }}
    >
      {/* 画面上部のナビゲーション（シンプルに2画面） */}
      <header
        style={{
          marginBottom: "20px",
          paddingBottom: "10px",
          borderBottom: "2px solid #ccc",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "1.2rem" }}>予約システム</h2>
        <nav style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => setCurrentPage("top")}
            style={{
              fontWeight: currentPage === "top" ? "bold" : "normal",
              padding: "6px 12px",
            }}
          >
            トップページ（予約入力）
          </button>
          <button
            onClick={() => {
              setCurrentPage("mypage");
              setReservations([]);
              setSearchEmail("");
            }}
            style={{
              fontWeight: currentPage === "mypage" ? "bold" : "normal",
              padding: "6px 12px",
            }}
          >
            マイページ（確認・一覧）
          </button>
        </nav>
      </header>

      {message && <p style={{ color: "red" }}>{message}</p>}

      {/* ==========================================
          1. トップページ（予約入力画面）
          ========================================== */}
      {currentPage === "top" && (
        <main
          style={{
            border: "1px solid #ccc",
            padding: "20px",
            borderRadius: "5px",
            backgroundColor: "#fff",
          }}
        >
          <h2>トップページ（予約入力画面）</h2>
          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: "12px" }}>
              <label>お名前: </label>
              <br />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ width: "100%", padding: "6px" }}
              />
            </div>
            <div style={{ marginBottom: "12px" }}>
              <label>メールアドレス: </label>
              <br />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: "100%", padding: "6px" }}
              />
            </div>
            <div style={{ marginBottom: "12px" }}>
              <label>電話番号: </label>
              <br />
              <input
                type="tel"
                value={tel}
                onChange={(e) => setTel(e.target.value)}
                required
                style={{ width: "100%", padding: "6px" }}
              />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label>予約希望日: </label>
              <br />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                style={{ width: "100%", padding: "6px" }}
              />
            </div>
            <button
              type="submit"
              style={{
                padding: "10px 20px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                cursor: "pointer",
                width: "100%",
                fontSize: "1rem",
              }}
            >
              予約する
            </button>
          </form>
        </main>
      )}

      {/* ==========================================
          2. マイページ（利用者向け予約確認画面）
          ========================================== */}
      {currentPage === "mypage" && (
        <main
          style={{
            border: "1px solid #ccc",
            padding: "20px",
            borderRadius: "5px",
            backgroundColor: "#fff",
          }}
        >
          <h2>マイページ（利用者向け予約確認）</h2>
          <p style={{ fontSize: "0.9rem", color: "#555" }}>
            ご自身のメールアドレスを入力して、予約状況の確認・キャンセルを行ってください。
          </p>

          <form
            onSubmit={handleSearchSubmit}
            style={{ marginBottom: "20px", display: "flex", gap: "8px" }}
          >
            <input
              type="email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              placeholder="登録したメールアドレスを入力"
              required
              style={{ padding: "6px", flex: 1 }}
            />
            <button type="submit" style={{ padding: "6px 12px" }}>
              自分の予約を検索
            </button>
          </form>

          {reservations.length === 0 ? (
            <p style={{ color: "#666" }}>該当する予約データはありません。</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {reservations.map((res) => (
                <li
                  key={res.id}
                  style={{
                    border: "1px solid #e0e0e0",
                    padding: "15px",
                    marginBottom: "12px",
                    borderRadius: "6px",
                    backgroundColor: "#fafafa",
                  }}
                >
                  <p style={{ margin: "4px 0" }}>
                    <strong>予約ID:</strong> {res.id}
                  </p>
                  <p style={{ margin: "4px 0" }}>
                    <strong>お名前:</strong> {res.name}
                  </p>
                  <p style={{ margin: "4px 0" }}>
                    <strong>メール:</strong> {res.email}
                  </p>
                  <p style={{ margin: "4px 0" }}>
                    <strong>電話番号:</strong> {res.tel}
                  </p>
                  <p style={{ margin: "4px 0" }}>
                    <strong>希望日:</strong> {res.date}
                  </p>

                  <p style={{ margin: "4px 0" }}>
                    <strong>ステータス:</strong>{" "}
                    <span
                      style={{
                        color: res.status === "キャンセル" ? "red" : "green",
                        fontWeight: "bold",
                      }}
                    >
                      {res.status}
                    </span>
                  </p>

                  {res.status !== "キャンセル" && (
                    <button
                      onClick={() => handleCancel(res.id)}
                      style={{
                        backgroundColor: "#d32f2f",
                        color: "white",
                        border: "none",
                        padding: "6px 12px",
                        cursor: "pointer",
                        marginTop: "10px",
                        borderRadius: "4px",
                      }}
                    >
                      この予約をキャンセル
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </main>
      )}

      {/* ==========================================
          3. 予約完了ポップアップ（モーダル）
          ========================================== */}
      {showModal && registeredData && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "30px",
              borderRadius: "8px",
              width: "90%",
              maxWidth: "400px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
              textAlign: "center",
            }}
          >
            <h3 style={{ color: "#2e7d32", marginTop: 0 }}>
              予約が完了しました！
            </h3>
            <p style={{ fontSize: "0.95rem", color: "#555" }}>
              ご予約ありがとうございます。以下の内容で登録されました。
            </p>

            <div
              style={{
                background: "#f9f9f9",
                padding: "12px",
                borderRadius: "5px",
                margin: "15px 0",
                textAlign: "left",
                border: "1px solid #eee",
              }}
            >
              <p style={{ margin: "4px 0" }}>
                <strong>予約ID:</strong> {registeredData.id}
              </p>
              <p style={{ margin: "4px 0" }}>
                <strong>お名前:</strong> {registeredData.name}
              </p>
              <p style={{ margin: "4px 0" }}>
                <strong>メール:</strong> {registeredData.email}
              </p>
              <p style={{ margin: "4px 0" }}>
                <strong>希望日:</strong> {registeredData.date}
              </p>
            </div>

            <div
              style={{ display: "flex", gap: "10px", justifyContent: "center" }}
            >
              <button
                onClick={() => setShowModal(false)}
                style={{ padding: "8px 15px", cursor: "pointer" }}
              >
                閉じる
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setCurrentPage("mypage");
                  setSearchEmail(registeredData.email);
                  handleSearchByEmail(registeredData.email);
                }}
                style={{
                  padding: "8px 15px",
                  backgroundColor: "#1976d2",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                マイページで確認する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
