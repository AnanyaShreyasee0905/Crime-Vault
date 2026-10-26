package com.crimevault.controller;

import com.crimevault.dao.CustodyRecordStore;
import com.crimevault.dao.EvidenceStore;
import com.crimevault.dao.ForensicExaminationStore;
import com.crimevault.dao.ForensicReportStore;
import com.crimevault.dao.InterviewStore;
import com.crimevault.dao.InvestigationEventStore;
import com.crimevault.dao.InvestigatorStore;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = {
        EvidenceController.class, CustodyRecordController.class, InterviewController.class,
        InvestigationEventController.class, ForensicExaminationController.class,
        ForensicReportController.class, InvestigatorController.class
})
class NewModuleControllerTests {
    @Autowired private MockMvc mvc;
    @MockBean private EvidenceStore evidenceStore;
    @MockBean private CustodyRecordStore custodyStore;
    @MockBean private InterviewStore interviewStore;
    @MockBean private InvestigationEventStore eventStore;
    @MockBean private ForensicExaminationStore examinationStore;
    @MockBean private ForensicReportStore reportStore;
    @MockBean private InvestigatorStore investigatorStore;

    @Test
    void evidenceCreateRouteValidatesAndReturnsCreated() throws Exception {
        when(evidenceStore.save(any())).thenAnswer(call -> call.getArgument(0));
        mvc.perform(post("/api/evidence").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"caseId\":4,\"evidenceType\":\"Digital Device\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.caseId").value(4))
                .andExpect(jsonPath("$.evidenceType").value("Digital Device"));
    }

    @Test
    void evidenceCreateRejectsMissingForeignKeyBeforeDatabaseCall() throws Exception {
        mvc.perform(post("/api/evidence").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"evidenceType\":\"Digital Device\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.path").value("/api/evidence"));
    }

    @Test
    void custodyTransferCreateRouteReturnsCreated() throws Exception {
        when(custodyStore.recordTransfer(any())).thenAnswer(call -> call.getArgument(0));
        mvc.perform(post("/api/custody-records").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"evidenceId\":5,\"toInvestigatorId\":8,\"transferDateTime\":\"2026-10-24T10:30:00\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.evidenceId").value(5))
                .andExpect(jsonPath("$.toInvestigatorId").value(8));
    }

    @Test
    void interviewCreateRouteReturnsCreated() throws Exception {
        when(interviewStore.save(any())).thenAnswer(call -> call.getArgument(0));
        mvc.perform(post("/api/interviews").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"caseId\":4,\"personId\":3,\"investigatorId\":8,\"interviewDateTime\":\"2026-10-24T10:30:00\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.personId").value(3));
    }

    @Test
    void investigationEventCreateRouteReturnsCreated() throws Exception {
        when(eventStore.save(any())).thenAnswer(call -> call.getArgument(0));
        mvc.perform(post("/api/investigation-events").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"caseId\":4,\"investigatorId\":8,\"eventDateTime\":\"2026-10-24T10:30:00\",\"eventType\":\"Evidence Review\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.eventType").value("Evidence Review"));
    }

    @Test
    void forensicExaminationCreateRouteReturnsCreated() throws Exception {
        when(examinationStore.save(any())).thenAnswer(call -> call.getArgument(0));
        mvc.perform(post("/api/forensic-examinations").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"evidenceId\":5,\"examinerId\":8,\"examinationType\":\"Metadata Review\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.evidenceId").value(5));
    }

    @Test
    void forensicReportCreateRouteReturnsCreated() throws Exception {
        when(reportStore.save(any())).thenAnswer(call -> call.getArgument(0));
        mvc.perform(post("/api/forensic-reports").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"examinationId\":9,\"reportDate\":\"2026-10-24\",\"conclusion\":\"Review conclusion\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.examinationId").value(9));
    }

    @Test
    void databaseConstraintFailuresUseConflictResponse() throws Exception {
        when(evidenceStore.save(any())).thenThrow(new DataIntegrityViolationException("database detail"));
        mvc.perform(post("/api/evidence").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"caseId\":999999,\"evidenceType\":\"Digital Device\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("The request conflicts with a database key or relationship constraint"));
    }

    @Test
    void investigatorPostAndPutMappingsExistInCurrentController() throws Exception {
        when(investigatorStore.save(any())).thenAnswer(call -> call.getArgument(0));
        mvc.perform(post("/api/investigators").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Mapping Check\"}"))
                .andExpect(status().isCreated());
        mvc.perform(put("/api/investigators/1001").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Mapping Check Updated\"}"))
                .andExpect(status().isOk());
    }

    @Test
    void evidenceUpdateRouteReturnsUpdatedRecord() throws Exception {
        when(evidenceStore.save(any())).thenAnswer(call -> call.getArgument(0));
        mvc.perform(put("/api/evidence/5").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"caseId\":4,\"evidenceType\":\"Updated Device\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.evidenceId").value(5))
                .andExpect(jsonPath("$.evidenceType").value("Updated Device"));
    }

    @Test
    void interviewUpdateRouteReturnsUpdatedRecord() throws Exception {
        when(interviewStore.save(any())).thenAnswer(call -> call.getArgument(0));
        mvc.perform(put("/api/interviews/6").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"caseId\":4,\"personId\":3,\"investigatorId\":8,\"interviewDateTime\":\"2026-10-24T10:30:00\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.interviewId").value(6));
    }

    @Test
    void eventUpdateRouteReturnsUpdatedRecord() throws Exception {
        when(eventStore.save(any())).thenAnswer(call -> call.getArgument(0));
        mvc.perform(put("/api/investigation-events/7").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"caseId\":4,\"investigatorId\":8,\"eventDateTime\":\"2026-10-24T10:30:00\",\"eventType\":\"Interview Completed\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.eventId").value(7));
    }

    @Test
    void examinationUpdateRouteReturnsUpdatedRecord() throws Exception {
        when(examinationStore.save(any())).thenAnswer(call -> call.getArgument(0));
        mvc.perform(put("/api/forensic-examinations/8").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"evidenceId\":5,\"examinerId\":8,\"examinationType\":\"Metadata Review\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.examinationId").value(8));
    }

    @Test
    void reportUpdateRouteReturnsUpdatedRecord() throws Exception {
        when(reportStore.save(any())).thenAnswer(call -> call.getArgument(0));
        mvc.perform(put("/api/forensic-reports/9").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"examinationId\":8,\"reportDate\":\"2026-10-24\",\"conclusion\":\"Updated conclusion\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reportId").value(9));
    }

    @Test
    void malformedDateTimeIsReportedAsBadRequest() throws Exception {
        mvc.perform(post("/api/investigation-events").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"caseId\":4,\"investigatorId\":8,\"eventDateTime\":\"yesterday\",\"eventType\":\"Note\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Request body is malformed or contains an invalid date/time value"));
    }
    @Test
    void evidenceDeleteReturnsNoContentWhenUnreferenced() throws Exception {
        when(evidenceStore.deleteById(5L)).thenReturn(1);
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete("/api/evidence/5"))
                .andExpect(status().isNoContent());
    }

    @Test
    void interviewDeleteReturnsNoContentWhenPresent() throws Exception {
        when(interviewStore.deleteById(6L)).thenReturn(1);
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete("/api/interviews/6"))
                .andExpect(status().isNoContent());
    }

    @Test
    void eventDeleteReturnsNoContentWhenPresent() throws Exception {
        when(eventStore.deleteById(7L)).thenReturn(1);
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete("/api/investigation-events/7"))
                .andExpect(status().isNoContent());
    }

    @Test
    void examinationDeleteReturnsNoContentWhenNoReportReferencesIt() throws Exception {
        when(examinationStore.deleteById(8L)).thenReturn(1);
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete("/api/forensic-examinations/8"))
                .andExpect(status().isNoContent());
    }

    @Test
    void reportDeleteReturnsNoContentWhenPresent() throws Exception {
        when(reportStore.deleteById(9L)).thenReturn(1);
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete("/api/forensic-reports/9"))
                .andExpect(status().isNoContent());
    }

    @Test
    void evidenceDeleteReturnsConflictWhenForeignKeyPreventsRemoval() throws Exception {
        when(evidenceStore.deleteById(5L)).thenThrow(new DataIntegrityViolationException("referenced evidence"));
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete("/api/evidence/5"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("The request conflicts with a database key or relationship constraint"));
    }

}
