import Foundation
import UIKit
import Capacitor
import AuthenticationServices

// Native Sign in with Apple (same JS API as @capacitor-community/apple-sign-in).
// Vendored into the App target because the project uses Swift Package Manager
// and the community plugin ships CocoaPods only.
@objc(SignInWithApple)
public class SignInWithApple: CAPPlugin, CAPBridgedPlugin, ASAuthorizationControllerDelegate, ASAuthorizationControllerPresentationContextProviding {
    public let identifier = "SignInWithApple"
    public let jsName = "SignInWithApple"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "authorize", returnType: CAPPluginReturnPromise)
    ]
    private var pendingCall: CAPPluginCall?

    @objc func authorize(_ call: CAPPluginCall) {
        let request = ASAuthorizationAppleIDProvider().createRequest()
        var scopes: [ASAuthorization.Scope] = []
        let s = call.getString("scopes") ?? ""
        if s.contains("name") { scopes.append(.fullName) }
        if s.contains("email") { scopes.append(.email) }
        request.requestedScopes = scopes
        request.state = call.getString("state")
        request.nonce = call.getString("nonce")
        pendingCall = call
        DispatchQueue.main.async {
            let controller = ASAuthorizationController(authorizationRequests: [request])
            controller.delegate = self
            controller.presentationContextProvider = self
            controller.performRequests()
        }
    }

    public func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
        return self.bridge?.viewController?.view.window ?? UIWindow()
    }

    public func authorizationController(controller: ASAuthorizationController, didCompleteWithAuthorization authorization: ASAuthorization) {
        guard let call = pendingCall else { return }
        pendingCall = nil
        guard let cred = authorization.credential as? ASAuthorizationAppleIDCredential,
              let tokenData = cred.identityToken,
              let token = String(data: tokenData, encoding: .utf8) else {
            call.reject("No identity token returned by Apple")
            return
        }
        var response: [String: Any] = ["user": cred.user, "identityToken": token]
        if let e = cred.email { response["email"] = e }
        if let g = cred.fullName?.givenName { response["givenName"] = g }
        if let f = cred.fullName?.familyName { response["familyName"] = f }
        if let c = cred.authorizationCode, let code = String(data: c, encoding: .utf8) { response["authorizationCode"] = code }
        call.resolve(["response": response])
    }

    public func authorizationController(controller: ASAuthorizationController, didCompleteWithError error: Error) {
        guard let call = pendingCall else { return }
        pendingCall = nil
        call.reject(error.localizedDescription, "\((error as NSError).code)")
    }
}

class MainViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(SignInWithApple())
    }
}
