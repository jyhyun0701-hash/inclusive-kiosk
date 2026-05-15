package com.kiosk.kioskserver.dto;

import com.kiosk.kioskserver.entity.Certificate;
import lombok.Getter;

/**
 * 증명서 응답 DTO.
 *
 * @author Jiyeon, Hyun
 * @since 2026-05-14
 */
@Getter
public class CertificateResponse {

    private final String id;
    private final String category;
    private final String nameKo;
    private final String nameEn;
    private final String nameJa;
    private final String nameZh;
    private final int    fee;

    private CertificateResponse(Certificate c) {
        this.id       = String.valueOf(c.getId());
        this.category = c.getCategory();
        this.nameKo   = c.getNameKo();
        this.nameEn   = c.getNameEn();
        this.nameJa   = c.getNameJa();
        this.nameZh   = c.getNameZh();
        this.fee      = c.getFee() != null ? c.getFee() : 0;
    }

    // 엔티티 → DTO 변환 팩토리 메서드
    public static CertificateResponse from(Certificate certificate) {
        return new CertificateResponse(certificate);
    }
}
