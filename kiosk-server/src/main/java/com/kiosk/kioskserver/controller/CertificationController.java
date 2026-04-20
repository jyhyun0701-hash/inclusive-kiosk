package com.kiosk.kioskserver.controller;

import com.kiosk.kioskserver.entity.Certificate;
import com.kiosk.kioskserver.repository.CertificateRepository;
import com.kiosk.kioskserver.service.CertificateService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/certificates")
@RequiredArgsConstructor
public class CertificationController {

    private final CertificateService certificateService;

    @GetMapping
    public List<Certificate> getAll() {
        return certificateService.getAll();
    }

    @GetMapping("/category/{category}")
    public List<Certificate> getByCategory(@PathVariable String category) {
        return certificateService.getByCategory(category);
    }
}
