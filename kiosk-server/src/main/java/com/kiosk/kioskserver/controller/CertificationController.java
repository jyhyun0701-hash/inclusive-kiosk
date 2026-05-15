package com.kiosk.kioskserver.controller;

import com.kiosk.kioskserver.dto.CertificateResponse;
import com.kiosk.kioskserver.entity.Certificate;
import com.kiosk.kioskserver.repository.CertificateRepository;
import com.kiosk.kioskserver.service.CertificateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 증명서 컨트롤러.
 *
 * @author  jiyeon, Hyun
 * @since 2026-05-14
 */

@RestController
@RequestMapping("/api/certificates")
@RequiredArgsConstructor
@CrossOrigin(origins = "${http://localhost:5173/}")
public class CertificationController {

    private final CertificateService certificateService;

    @GetMapping
    public ResponseEntity<List<CertificateResponse>> getCertificates(
            @RequestParam(required = false) String category
    ) {
        List<CertificateResponse> result = (category != null && !category.isBlank())
                ? certificateService.getByCategory(category)
                : certificateService.getAllActive();

        return ResponseEntity.ok(result);
    }
}
