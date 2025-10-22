// Dealer.jsx (bản vá)
import React, { useState,useEffect } from 'react';
import { useParams } from 'react-router-dom';
import "./Dealers.css";
import "../assets/style.css";
import positive_icon from "../assets/positive.png"
import neutral_icon from "../assets/neutral.png"
import negative_icon from "../assets/negative.png"
import review_icon from "../assets/reviewbutton.png"
import Header from '../Header/Header';

const Dealer = () => {
  const [dealer, setDealer] = useState({});           // luôn là object
  const [reviews, setReviews] = useState([]);
  const [unreviewed, setUnreviewed] = useState(false);
  const [postReview, setPostReview] = useState(null);

  const { id } = useParams();
  const origin = window.location.origin;

  const dealer_url  = `${origin}/djangoapp/dealer/${id}`;
  const reviews_url = `${origin}/djangoapp/reviews/dealer/${id}`;
  const post_review = `/postreview/${id}`;

  const get_dealer = async () => {
    try {
      const res = await fetch(dealer_url);
      const retobj = await res.json();
      // console.log('dealer retobj', retobj); // bật tạm để kiểm
      if (retobj?.status === 200) {
        const d = retobj.dealer;
        // backend có thể trả list [dealer] hoặc object đơn
        const picked = Array.isArray(d) ? (d[0] || {}) : (d || {});
        setDealer(picked || {});   // KHÔNG set undefined
      } else {
        setDealer({});
      }
    } catch (e) {
      console.error('get_dealer error', e);
      setDealer({});
    }
  };

  const get_reviews = async () => {
    try {
      const res = await fetch(reviews_url);
      const retobj = await res.json();
      // console.log('reviews retobj', retobj);
      if (retobj?.status === 200) {
        const arr = Array.isArray(retobj.reviews) ? retobj.reviews : [];
        if (arr.length) setReviews(arr);
        else setUnreviewed(true);
      } else {
        setUnreviewed(true);
      }
    } catch (e) {
      console.error('get_reviews error', e);
      setUnreviewed(true);
    }
  };

  const senti_icon = (sentiment) =>
    sentiment === "positive" ? positive_icon :
    sentiment === "negative" ? negative_icon : neutral_icon;

  useEffect(() => {
    get_dealer();
    get_reviews();
    if (sessionStorage.getItem("username")) {
      setPostReview(
        <a href={post_review}>
          <img src={review_icon} style={{width:'10%',marginLeft:'10px',marginTop:'10px'}} alt='Post Review'/>
        </a>
      );
    } else {
      setPostReview(null);
    }
  }, [id]); // đổi dealer khi route/id đổi

  const hasDealer = dealer && Object.keys(dealer).length > 0;

  return (
    <div style={{margin:"20px"}}>
      <Header/>
      <div style={{marginTop:"10px"}}>
        <h1 style={{color:"grey"}}>
          {hasDealer ? dealer.full_name : 'Loading dealer...'} {postReview}
        </h1>
        {hasDealer && (
          <h4 style={{color:"grey"}}>
            {dealer.city}, {dealer.address}, Zip - {dealer.zip}, {dealer.state}
          </h4>
        )}
      </div>

      <div className="reviews_panel">
        {!hasDealer ? (
          <div>Loading...</div>
        ) : reviews.length === 0 && !unreviewed ? (
          <div>Loading Reviews....</div>
        ) : unreviewed ? (
          <div>No reviews yet!</div>
        ) : (
          reviews.map((review, idx) => (
            <div key={idx} className='review_panel'>
              <img src={senti_icon(review.sentiment)} className="emotion_icon" alt='Sentiment'/>
              <div className='review'>{review.review}</div>
              <div className="reviewer">
                {review.name} {review.car_make} {review.car_model} {review.car_year}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dealer;
