package com.kiosk.kioskserver.entity;

import jakarta.persistence.*;
import lombok.*;

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
    private Integer fee;

    @Column(name = "is_active", nullable = false)
    private boolean active;

}
