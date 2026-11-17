import { useState } from "react";
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
        setRegisteredData(data);
        setShowModal(true); // ポップアップを表示

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

  // 物理削除処理（DELETE /api/reservations/{id}）
  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "本当にこの予約データを完全に削除しますか？（※この操作は元に戻せません）",
      )
    )
      return;

    try {
      const response = await fetch(
        `http://localhost:8080/api/reservations/${id}`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        alert("予約データを完全に削除しました。");
        handleSearchByEmail(searchEmail);
      } else {
        alert("削除に失敗しました。");
      }
    } catch (error) {
      console.error("削除エラー:", error);
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
    <div className="app-container">
      {/* ヘッダー・ナビゲーション */}
      <header>
        <h2>予約システム</h2>
        <nav>
          <button
            onClick={() => setCurrentPage("top")}
            className={currentPage === "top" ? "active" : ""}
          >
            トップページ（予約入力）
          </button>
          <button
            onClick={() => {
              setCurrentPage("mypage");
              setReservations([]);
              setSearchEmail("");
            }}
            className={currentPage === "mypage" ? "active" : ""}
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
        <main>
          <h2>トップページ（予約入力画面）</h2>
          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: "16px" }}>
              <label>お名前</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="例：山田 太郎"
              />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label>メールアドレス</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="例：example@email.com"
              />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label>電話番号</label>
              <input
                type="tel"
                value={tel}
                onChange={(e) => setTel(e.target.value)}
                required
                placeholder="例：09012345678"
              />
            </div>
            <div style={{ marginBottom: "24px" }}>
              <label>予約希望日</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <button type="submit">予約する</button>
          </form>
        </main>
      )}

      {/* ==========================================
          2. マイページ（利用者向け予約確認画面）
          ========================================== */}
      {currentPage === "mypage" && (
        <main>
          <h2>マイページ（利用者向け予約確認）</h2>
          <p
            style={{ fontSize: "0.9rem", color: "#555", marginBottom: "16px" }}
          >
            ご自身のメールアドレスを入力して、予約状況の確認・キャンセル・削除を行ってください。
          </p>

          <form onSubmit={handleSearchSubmit}>
            <input
              type="email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              placeholder="登録したメールアドレスを入力"
              required
            />
            <button type="submit">検索</button>
          </form>

          {reservations.length === 0 ? (
            <p
              style={{ color: "#666", textAlign: "center", padding: "20px 0" }}
            >
              該当する予約データはありません。
            </p>
          ) : (
            <ul>
              {reservations.map((res) => (
                <li
                  key={res.id}
                  style={{
                    marginBottom: "20px",
                    borderBottom: "1px solid #ddd",
                    paddingBottom: "15px",
                  }}
                >
                  <p>
                    <strong>予約ID:</strong> {res.id}
                  </p>
                  <p>
                    <strong>お名前:</strong> {res.name}
                  </p>
                  <p>
                    <strong>メール:</strong> {res.email}
                  </p>
                  <p>
                    <strong>電話番号:</strong> {res.tel}
                  </p>
                  <p>
                    <strong>希望日:</strong> {res.date}
                  </p>

                  <p>
                    <strong>ステータス:</strong>{" "}
                    <span
                      style={{
                        color:
                          res.status === "キャンセル" ? "#d32f2f" : "#2e7d32",
                        fontWeight: "bold",
                      }}
                    >
                      {res.status}
                    </span>
                  </p>

                  <div
                    style={{ display: "flex", gap: "10px", marginTop: "10px" }}
                  >
                    {res.status !== "キャンセル" && (
                      <button onClick={() => handleCancel(res.id)}>
                        この予約をキャンセル
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(res.id)}
                      style={{ backgroundColor: "#d32f2f", color: "white" }}
                    >
                      完全に削除する
                    </button>
                  </div>
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
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ color: "#2e7d32", marginTop: 0 }}>
              予約が完了しました！
            </h3>
            <p style={{ fontSize: "0.95rem", color: "#555" }}>
              ご予約ありがとうございます。以下の内容で登録されました。
            </p>

            <div
              style={{
                background: "#f9f9f9",
                padding: "14px",
                borderRadius: "8px",
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
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "center",
                marginTop: "20px",
              }}
            >
              <button onClick={() => setShowModal(false)} className="btn-back">
                閉じる
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setCurrentPage("mypage");
                  setSearchEmail(registeredData.email);
                  handleSearchByEmail(registeredData.email);
                }}
                className="btn-primary"
                style={{
                  width: "auto",
                  padding: "8px 16px",
                  fontSize: "0.9rem",
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
