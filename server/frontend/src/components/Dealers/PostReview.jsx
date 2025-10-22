import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Dealers.css";
import "../assets/style.css";
import Header from "../Header/Header";

const API_BASE = `${window.location.origin}/djangoapp`;

function safeGetNameFromSession() {
  const first = sessionStorage.getItem("firstname");
  const last = sessionStorage.getItem("lastname");
  const user = sessionStorage.getItem("username");
  const full = [first, last].filter(Boolean).join(" ").trim();
  return full && !/null/i.test(full) ? full : user || "Anonymous";
}

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = 2010; // tuỳ bạn muốn giới hạn từ năm nào

const PostReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // UI state
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  // Data state
  const [dealer, setDealer] = useState({});
  const [carModels, setCarModels] = useState([]);

  // Form state
  const [review, setReview] = useState("");
  const [selectedModel, setSelectedModel] = useState(""); // value dạng "Make::Model"
  const [year, setYear] = useState("");
  const [date, setDate] = useState("");

  const dealerURL = useMemo(() => `${API_BASE}/dealer/${id}`, [id]);
  const carsURL = useMemo(() => `${API_BASE}/get_cars`, []);
  const postURL = useMemo(() => `${API_BASE}/add_review`, []);

  // Fetch dealer + car models song song
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError("");

    (async () => {
      try {
        const [dealerRes, carsRes] = await Promise.all([
          fetch(dealerURL),
          fetch(carsURL),
        ]);

        const dealerJson = await dealerRes.json().catch(() => ({}));
        const carsJson = await carsRes.json().catch(() => ({}));

        const dealerData = Array.isArray(dealerJson?.dealer)
          ? dealerJson.dealer[0] || {}
          : dealerJson?.dealer || {};

        const carsArr = Array.isArray(carsJson?.CarModels)
          ? carsJson.CarModels
          : [];

        if (isMounted) {
          if (dealerJson?.status !== 200) {
            throw new Error("Không lấy được thông tin đại lý.");
          }
          setDealer(dealerData || {});
          setCarModels(carsArr);
          setLoading(false);
        }
      } catch (e) {
        if (isMounted) {
          setError(e?.message || "Đã xảy ra lỗi khi tải dữ liệu.");
          setLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [dealerURL, carsURL]);

  // Tên người dùng từ sessionStorage
  const displayName = useMemo(() => safeGetNameFromSession(), []);

  // Tách make/model từ value "Make::Model"
  function parseMakeModel(val) {
    if (!val) return { make: "", model: "" };
    const [make, model] = val.split("::");
    return { make: make || "", model: model || "" };
  }

  // Validate form
  function validate() {
    if (!selectedModel) return "Bạn chưa chọn Car Make/Model.";
    if (!review.trim()) return "Bạn chưa nhập Review.";
    if (!date) return "Bạn chưa chọn Purchase Date.";
    if (!year) return "Bạn chưa nhập Car Year.";
    const y = +year;
    if (Number.isNaN(y) || y < MIN_YEAR || y > CURRENT_YEAR)
      return `Car Year phải trong khoảng ${MIN_YEAR}–${CURRENT_YEAR}.`;
    return "";
  }

  async function handlePost() {
    const msg = validate();
    if (msg) {
      alert(msg);
      return;
    }
    const { make, model } = parseMakeModel(selectedModel);
    const payload = {
      name: displayName,
      dealership: Number(id),
      review: review.trim(),
      purchase: true,
      purchase_date: date, // YYYY-MM-DD
      car_make: make,
      car_model: model,
      car_year: year,
    };

    try {
      setPosting(true);
      setError("");

      const res = await fetch(postURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));
      if (json?.status === 200) {
        // Điều hướng về trang dealer
        navigate(`/dealer/${id}`, { replace: true });
        return;
      }
      throw new Error(json?.message || "Post review thất bại.");
    } catch (e) {
      setError(e?.message || "Không thể gửi review lúc này.");
      alert(e?.message || "Không thể gửi review lúc này.");
    } finally {
      setPosting(false);
    }
  }

  // Render

  if (loading) {
    return (
      <div>
        <Header />
        <div style={{ margin: "5%" }}>Đang tải dữ liệu…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header />
        <div style={{ margin: "5%", color: "crimson" }}>{error}</div>
      </div>
    );
  }

  const hasDealer = dealer && Object.keys(dealer).length > 0;

  return (
    <div>
      <Header />
      <div style={{ margin: "5%" }}>
        <h1 style={{ color: "darkblue" }}>
          {hasDealer ? dealer.full_name : "Dealer"}
        </h1>

        <div className="input_field" style={{ marginBottom: 12 }}>
          <label htmlFor="review" style={{ display: "block", marginBottom: 6 }}>
            Your Review
          </label>
          <textarea
            id="review"
            cols="50"
            rows="7"
            value={review}
            onChange={(e) => setReview(e.target.value)}
          />
        </div>

        <div className="input_field" style={{ marginBottom: 12 }}>
          <label style={{ marginRight: 8 }}>Purchase Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={new Date().toISOString().slice(0, 10)}
          />
        </div>

        <div className="input_field" style={{ marginBottom: 12 }}>
          <label style={{ marginRight: 8 }}>Car Make / Model</label>
          <select
            name="cars"
            id="cars"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
          >
            <option value="" disabled hidden>
              Choose Car Make and Model
            </option>
            {carModels.map((c, idx) => {
              const value = `${c.CarMake}::${c.CarModel}`;
              const label = `${c.CarMake} ${c.CarModel}`;
              return (
                <option key={`${value}-${idx}`} value={value}>
                  {label}
                </option>
              );
            })}
          </select>
        </div>

        <div className="input_field" style={{ marginBottom: 20 }}>
          <label style={{ marginRight: 8 }}>Car Year</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            min={MIN_YEAR}
            max={CURRENT_YEAR}
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder={`${MIN_YEAR}–${CURRENT_YEAR}`}
            style={{ width: 120 }}
          />
        </div>

        <div>
          <button
            className="postreview"
            onClick={handlePost}
            disabled={posting}
          >
            {posting ? "Posting..." : "Post Review"}
          </button>
          <button
            style={{ marginLeft: 12 }}
            onClick={() => navigate(`/dealer/${id}`)}
            disabled={posting}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostReview;
