    "use client";

    import { useEffect, useState } from "react";
    import { Swiper, SwiperSlide } from "swiper/react";
    import { Autoplay, Navigation } from "swiper/modules";
    import { Row, Col } from "antd";
    import "swiper/css";
    import "swiper/css/navigation";
    import styles from "@/app/styles/banner.module.css";

    export default function Banner() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    const images = ["http://localhost:3000/images/banner1.jpg", "http://localhost:3000/images/banner2.jpg"];

    const features = [
        { icon: "http://localhost:3000/images/icon-menu2.png", label: "GIAO HÀNG SIÊU TỐC" },
        { icon: "http://localhost:3000/images/icon-menu1.png", label: "BỌC HỘP QUÀ XINH" },
        { icon: "http://localhost:3000/images/icon-menu3.png", label: "TẶNG THIỆP Ý NGHĨA" },
        { icon: "http://localhost:3000/images/icon-menu5.png", label: "NÉN NHỜ GẤU BÔNG" },
    ];

    return (
        <section className={styles.Slideshow}>
        {/* Render Swiper sau khi đã mounted để tránh lỗi và lặp */}
        {mounted && (
            <Swiper
            modules={[Autoplay, Navigation]}
            loop={true}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            navigation={true}
            className={styles.mySwiper}
            >
            {images.map((img, index) => (
                <SwiperSlide key={index}>
                <img
                    src={img}
                    alt={`Slide ${index + 1}`}
                    className={styles.slideImage}
                />
                </SwiperSlide>
            ))}
            </Swiper>
        )}

        {/* Features section */}
        <div className={styles.featuresContainer}>
            <Row gutter={[16, 24]} justify="center" style={{ marginTop: "30px" }}>
            {features.map((feature, index) => (
                <Col
                key={index}
                xs={12}
                sm={8}
                md={4}
                lg={4}
                style={{ textAlign: "center" }}
                >
                <img
                    src={feature.icon}
                    alt={feature.label}
                    width={60}
                    height={50}
                    style={{
                    marginBottom: "10px",
                    transition: "transform 0.3s ease",
                    }}
                    onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "scale(1.1)")
                    }
                    onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                    }
                />
                <div
                    style={{
                    color: "#f15cae",
                    fontSize: "14px",
                    fontWeight: "600",
                    }}
                >
                    {feature.label}
                </div>
                </Col>
            ))}
            </Row>
        </div>
        </section>
    );
    }
