package com.kiosk.kioskserver.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.ZonedDateTime;

/**
 * 증명서 테이블 매핑 엔티티.
 *
 * @author  jiyeon, Hyun
 * @since 2026-05-14
 */
@Entity
@Table(name = "certificates")
@Getter @NoArgsConstructor @AllArgsConstructor @Builder
public class Certificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String nameKo;

    private String nameEn;
    private String nameJa;
    private String nameZh;

    @Column
    private Integer fee;

    @Column(name = "is_active", nullable = false)
    private boolean active;

    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;
}
