package com.kiosk.kioskserver.repository;

import com.kiosk.kioskserver.entity.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * 증명서 레포지토리.
 *
 * @author  jiyeon, Hyun
 * @since 2026-05-14
 */

public interface CertificateRepository extends JpaRepository<Certificate, Long> {
    // is_active = true 인 증명서만 조회
    List<Certificate> findByActiveTrue();
    // 카페고리 + 활성화 조건으로 조회
    List<Certificate> findByCategoryAndActiveTrue(String category);
}
