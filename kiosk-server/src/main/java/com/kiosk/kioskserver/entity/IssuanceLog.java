package com.kiosk.kioskserver.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Entity
@Getter
@Setter
public class IssuanceLog {
    @Id
    @GeneratedValue
    private Long certificate_id;

    private String requester_name;
    private String status;
    private Date created_at;
    private Integer total_fee;
}
